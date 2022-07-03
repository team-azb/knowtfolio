package services

import (
	"context"
	"crypto/ecdsa"
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

	newArticle := models.NewArticle(request.Title, []byte(request.Content), request.Address)
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

		err = a.AuthorizeEdit(request.Address, targetArticle, true)
		if err != nil {
			return err
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

	target := models.Article{ID: request.ID}
	result := a.DB.First(&target)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articles.MakeArticleNotFound(result.Error)
	}

	err = a.AuthorizeEdit(request.Address, target, false)
	if err != nil {
		return nil, err
	}

	result = a.DB.Delete(&target)

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
	if targetArticle.OriginalAuthorAddress != request.Address {
		msg := fmt.Sprintf("Address %v is not the orignial owner of article %v.", request.Address, targetArticle.ID)
		return nil, articles.MakeUnauthorized(errors.New(msg))
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

func (a articleService) AuthorizeEdit(editorAddr string, target models.Article, requireNFT bool) error {
	privateKey, _ := crypto.HexToECDSA(config.AdminPrivateKey)
	publicKey := privateKey.Public()
	publicKeyECDSA, _ := publicKey.(*ecdsa.PublicKey)
	address := crypto.PubkeyToAddress(*publicKeyECDSA)

	isNftOwner, err := a.Contract.IsOwnerOfArticle(&bind.CallOpts{From: address}, common.HexToAddress(editorAddr), target.ID)
	if err != nil {
		// TODO: 現状NFTがない場合errが帰ってくる
		isNftOwner = false
		//return err
	}
	isOriginalAuthor := editorAddr == target.OriginalAuthorAddress

	if isNftOwner || (!requireNFT && isOriginalAuthor) {
		return nil
	} else {
		msg := fmt.Sprintf("Address %v is not the owner of article %v.", editorAddr, target.ID)
		return articles.MakeUnauthorized(errors.New(msg))
	}
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
