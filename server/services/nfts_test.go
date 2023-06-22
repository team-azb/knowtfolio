package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	awscfg "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	goethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/nfts"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	"io"
	"testing"
	"time"
)

func prepareNftsService(t *testing.T) nftsService {
	t.Parallel()

	cfg, err := awscfg.LoadDefaultConfig(context.Background())
	if err != nil {
		t.Fatal(err)
	}

	service := nftsService{
		DB:             initTestDB(t),
		Contract:       initTestContractClient(t),
		S3Client:       s3.NewFromConfig(cfg),
		DynamoDBClient: aws.NewDynamoDBClient(),
	}

	return service
}

var (
	user0MintNFTSign = "0xae7675c53b24e2612b9dce083901989ed5485b77d16f7852013757c7f034c76807d7348655db3783a58319c04d1bf958d21c3cb849922abe4cc2c2badfac4b1b00"
)

func TestCreateNFTForArticle(t *testing.T) {
	service := prepareNftsService(t)

	service.DB.Create(&article0)

	transactionLock[*testUsers[0].Address()].Lock()
	result, err := service.CreateForArticle(context.Background(), &nfts.CreateNftForArticleRequest{
		ArticleID: article0.ID,
		Address:   *testUsers[0].Address(),
		Signature: testUsers[0].GenerateSignature(config.SignData["CreateNFT"]),
	})
	transactionLock[*testUsers[0].Address()].Unlock()
	assert.NoError(t, err)

	// Remove s3 object after the test is done.
	// TODO: Remove this part after LocalStack is introduced.
	objectKey := fmt.Sprintf("nfts/%v.json", article0.ID)
	t.Cleanup(func() {
		_, _ = service.S3Client.DeleteObject(context.Background(), &s3.DeleteObjectInput{
			Bucket: &config.S3BucketName,
			Key:    &objectKey,
		})
	})

	// Assert NFT existence.
	nftMinted := waitForNFTByHash(service.Contract, result.Hash)
	actualOwner, err := service.Contract.GetOwnerOfArticle(&bind.CallOpts{}, article0.ID)
	assert.True(t, nftMinted)
	assert.NoError(t, err)
	assert.Equal(t, *testUsers[0].Address(), actualOwner.String())

	// Assert metadata existence.
	getObjOutput, reqErr := service.S3Client.GetObject(context.Background(), &s3.GetObjectInput{
		Bucket: &config.S3BucketName,
		Key:    &objectKey,
	})
	actualJSONBuf := new(bytes.Buffer)
	_, copyErr := io.Copy(actualJSONBuf, getObjOutput.Body)
	metadata := models.NewNFTMetadata(article0)
	expectedJSON, jsonErr := metadata.ToJSON()
	assert.NoError(t, reqErr, copyErr, jsonErr)
	assert.JSONEq(t, string(expectedJSON), actualJSONBuf.String())

	// Assert DB change.
	target := models.Article{ID: article0.ID}
	res := service.DB.First(&target)
	assert.NoError(t, res.Error)
	assert.True(t, target.IsTokenized)
}

func waitForNFTByHash(cli *ethereum.ContractClient, txHash string) bool {
	queryTicker := time.NewTicker(time.Millisecond)

	// Timeout in 10 secs.
	go func() {
		time.Sleep(time.Second * 10)
		queryTicker.Stop()
	}()

	for range queryTicker.C {
		_, err := cli.TransactionReceipt(context.Background(), common.HexToHash(txHash))
		if err == nil {
			return true
		}

		if !errors.Is(err, goethereum.NotFound) {
			return false
		}
	}
	return false
}
