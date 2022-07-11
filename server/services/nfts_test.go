package services

import (
	"context"
	"errors"
	goethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/nfts"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	"testing"
	"time"
)

func prepareNftsService(t *testing.T) nftsService {
	t.Parallel()

	service := nftsService{
		DB:       initTestDB(t),
		Contract: initTestContractClient(t),
	}
	err := service.DB.AutoMigrate(models.Article{})
	if err != nil {
		t.Fatal(err)
	}

	return service
}

var (
	user0MintNFTSign = "0xae7675c53b24e2612b9dce083901989ed5485b77d16f7852013757c7f034c76807d7348655db3783a58319c04d1bf958d21c3cb849922abe4cc2c2badfac4b1b00"
)

func TestCreateNFTForArticle(t *testing.T) {
	service := prepareNftsService(t)

	service.DB.Create(&article0)

	result, err := service.CreateForArticle(context.Background(), &nfts.CreateNftForArticleRequest{
		ArticleID: article0.ID,
		Address:   user0Addr,
		Signature: user0MintNFTSign,
	})
	assert.NoError(t, err)

	// Assert NFT existence.
	nftMinted := waitForNFTByHash(service.Contract, result.Hash)
	actualOwner, err := service.Contract.GetOwnerOfArticle(&bind.CallOpts{}, article0.ID)
	assert.True(t, nftMinted)
	assert.NoError(t, err)
	assert.Equal(t, article0.OriginalAuthorAddress, actualOwner.String())
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
