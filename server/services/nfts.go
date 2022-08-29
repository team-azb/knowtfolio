package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/nfts/server"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/nfts"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
)

type nftsService struct {
	DB       *gorm.DB
	Contract *ethereum.ContractClient
	S3Client *s3.Client
}

func NewNftsService(db *gorm.DB, contract *ethereum.ContractClient, s3Client *s3.Client, handler HttpHandler) *server.Server {
	endpoints := nfts.NewEndpoints(nftsService{DB: db, Contract: contract, S3Client: s3Client})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (s nftsService) CreateForArticle(ctx context.Context, request *nfts.CreateNftForArticleRequest) (res *nfts.CreateNftForArticleResult, err error) {
	err = VerifySignature(request.Address, request.Signature, config.SignData["CreateNFT"])
	if err != nil {
		return nil, nfts.MakeUnauthenticated(err)
	}

	// Find corresponding Article from DB
	target := models.Article{ID: request.ArticleID}

	err = s.DB.Transaction(func(tx *gorm.DB) error {
		// Get target Article and check the author
		result := tx.First(&target)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nfts.MakeArticleNotFound(result.Error)
		} else if result.Error != nil {
			return result.Error
		}
		if target.OriginalAuthorAddress != request.Address {
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

// VerifySignature checks if `sign` is a signature that is signed by `addr` using `signedData`.
func VerifySignature(addr string, sign string, signedData string) error {
	decodedSign, err := hexutil.Decode(sign)
	if err != nil {
		return err
	}

	// NOTE: Some client generates 27/28 instead of 0/1 due to Legacy Ethereum
	// ref) https://github.com/ethereum/go-ethereum/issues/19751#issuecomment-504900739
	if decodedSign[crypto.RecoveryIDOffset] >= 27 {
		decodedSign[crypto.RecoveryIDOffset] -= 27
	}

	hash := accounts.TextHash([]byte(signedData))
	pubKey, err := crypto.SigToPub(hash, decodedSign)
	if err != nil {
		return err
	}

	signedAddr := crypto.PubkeyToAddress(*pubKey)
	if addr != signedAddr.String() {
		return errors.New("`address` didn't match the signer")
	}

	return nil
}
