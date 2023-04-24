package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/ethereum/go-ethereum/common"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/nfts/server"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/nfts"
	awsutil "github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
)

type nftsService struct {
	DB             *gorm.DB
	Contract       *ethereum.ContractClient
	S3Client       *s3.Client
	DynamoDBClient *awsutil.DynamoDBClient
}

func NewNftsService(db *gorm.DB, contract *ethereum.ContractClient, s3Client *s3.Client, dynamodbClient *awsutil.DynamoDBClient, handler HttpHandler) *server.Server {
	endpoints := nfts.NewEndpoints(nftsService{DB: db, Contract: contract, S3Client: s3Client, DynamoDBClient: dynamodbClient})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (s nftsService) CreateForArticle(ctx context.Context, request *nfts.CreateNftForArticleRequest) (res *nfts.CreateNftForArticleResult, err error) {
	err = ethereum.VerifySignature(request.Address, request.Signature, config.SignData["CreateNFT"])
	if err != nil {
		return nil, nfts.MakeUnauthenticated(err)
	}

	// Find corresponding Article from DB
	target := models.Article{ID: request.ArticleID}

	err = s.DB.Transaction(func(tx *gorm.DB) error {
		// Get target Article
		result := tx.First(&target)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nfts.MakeArticleNotFound(result.Error)
		} else if result.Error != nil {
			return result.Error
		}

		// Check the author of the article
		originalAuthorAddress, err := s.DynamoDBClient.GetAddressByID(target.OriginalAuthorID)
		if err != nil {
			return err
		}
		if originalAuthorAddress == nil || originalAuthorAddress.String() != request.Address {
			msg := fmt.Sprintf("Address %v is not the orignial owner of article %v.", request.Address, target.ID)
			return nfts.MakeUnauthorized(errors.New(msg))
		}

		// Mint Article token
		opts, err := s.Contract.NewAdminTransactOpts()
		if err != nil {
			return err
		}
		mintTx, err := s.Contract.MintNFT(
			opts,
			common.HexToAddress(request.Address),
			target.ID)
		if err != nil {
			return err
		}

		// Upload NFT metadata to S3
		metadata := models.NewNFTMetadata(target)
		metadataJson, err := metadata.ToJSON()
		if err != nil {
			return err
		}

		uploader := manager.NewUploader(s.S3Client)
		_, err = uploader.Upload(ctx, &s3.PutObjectInput{
			Body:        bytes.NewReader(metadataJson),
			Bucket:      &config.S3BucketName,
			ContentType: aws.String("application/json"),
			Key:         aws.String(fmt.Sprintf("nfts/%v.json", target.ID)),
		})
		if err != nil {
			return err
		}

		// Save tokenized state of the Article.
		target.SetIsTokenized()
		result = tx.Save(&target)
		if result.Error != nil {
			return result.Error
		}

		res = &nfts.CreateNftForArticleResult{
			Hash: mintTx.Hash().String(),
			Cost: mintTx.Cost().Int64(),
		}
		return nil
	})

	return
}
