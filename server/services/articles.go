package services

import (
	"context"
	"errors"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/articles"
	articlesviews "github.com/team-azb/knowtfolio/server/gateways/api/gen/articles/views"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/articles/server"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
	"math/big"
)

type articleService struct {
	DB       *gorm.DB
	Contract *ethereum.ContractClient
}

func NewArticlesService(db *gorm.DB, contract *ethereum.ContractClient, handler HttpHandler) *server.Server {
	err := db.Migrator().AutoMigrate(models.Article{})
	if err != nil {
		panic(err.(any))
	}

	endpoints := articles.NewEndpoints(articleService{DB: db, Contract: contract})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (a articleService) Create(_ context.Context, request *articles.ArticleCreateRequest) (res *articles.ArticleResult, err error) {
	err = a.VerifySignature(request.Address, request.Signature, "Create Article")
	if err != nil {
		return nil, articles.MakeUnauthenticated(err)
	}

	newArticle := models.NewArticle(request.Title, []byte(request.Content))
	result := a.DB.Create(newArticle)
	return articleToResult(*newArticle), result.Error
}

func (a articleService) Read(_ context.Context, request *articles.ArticleReadRequest) (res *articles.ArticleResult, err error) {
	targetArticle := models.Article{ID: request.ID}
	result := a.DB.First(&targetArticle)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articles.MakeArticleNotFound(result.Error)
	}
	return articleToResult(targetArticle), result.Error
}

func (a articleService) Update(_ context.Context, request *articles.ArticleUpdateRequest) (res *articles.ArticleResult, err error) {
	err = a.VerifySignature(request.Address, request.Signature, "Update Article")
	if err != nil {
		return nil, articles.MakeUnauthenticated(err)
	}

	targetArticle := models.Article{ID: request.ID}

	err = a.DB.Transaction(func(tx *gorm.DB) error {
		result := tx.First(&targetArticle)
		if result.Error != nil {
			return result.Error
		}

		targetArticle.SetTitleIfPresent(request.Title)
		targetArticle.SetContentIfPresent(request.Content)
		result = tx.Save(&targetArticle)

		return result.Error
	})

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, articles.MakeArticleNotFound(err)
	}

	return articleToResult(targetArticle), err
}

func (a articleService) Delete(_ context.Context, request *articles.ArticleDeleteRequest) (res *articles.ArticleResult, err error) {
	err = a.VerifySignature(request.Address, request.Signature, "Delete Article")
	if err != nil {
		return nil, articles.MakeUnauthenticated(err)
	}

	result := a.DB.Delete(&models.Article{ID: request.ID})
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articles.MakeArticleNotFound(result.Error)
	}
	return articleIdToResult(request.ID), result.Error
}

func (a articleService) Tokenize(_ context.Context, request *articles.ArticleTokenizeRequest) (res *articles.ArticleTokenizeResult, err error) {
	err = a.VerifySignature(request.Address, request.Signature, "MINT NFT")
	if err != nil {
		return nil, articles.MakeUnauthenticated(err)
	}

	targetArticle := models.Article{ID: request.ID}
	result := a.DB.First(&targetArticle)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articles.MakeArticleNotFound(result.Error)
	}

	privateKey, _ := crypto.HexToECDSA(config.AdminPrivateKey)
	opts, err := bind.NewKeyedTransactorWithChainID(privateKey, big.NewInt(80001))
	tx, err := a.Contract.MintNFT(
		opts,
		common.HexToAddress(request.Address),
		fmt.Sprintf("https://knowtfolio.xyz/articles/%v", targetArticle.ID),
		targetArticle.ID)
	if err != nil {
		return nil, err
	}

	return &articles.ArticleTokenizeResult{
		Hash: tx.Hash().String(),
		Cost: tx.Cost().Int64(),
	}, nil
}

func (a articleService) VerifySignature(addr string, sign string, signedData string) error {
	decodedSign, err := hexutil.Decode(sign)
	if err != nil {
		return err
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

func articleToResult(src models.Article) *articles.ArticleResult {
	return &articles.ArticleResult{
		ID:      src.ID,
		Title:   src.Title,
		Content: string(src.Content),
	}
}

func articleIdToResult(src string) *articles.ArticleResult {
	return articles.NewArticleResult(&articlesviews.ArticleResult{
		Projected: &articlesviews.ArticleResultView{ID: &src},
		View:      "only-id",
	})
}
