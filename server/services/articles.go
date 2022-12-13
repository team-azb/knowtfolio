package services

import (
	"context"
	"errors"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/articles"
	articlesviews "github.com/team-azb/knowtfolio/server/gateways/api/gen/articles/views"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/articles/server"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
)

type articleService struct {
	DB             *gorm.DB
	Contract       *ethereum.ContractClient
	CognitoClient  *aws.CognitoClient
	DynamoDBClient *aws.DynamoDBClient
}

func NewArticlesService(db *gorm.DB, contract *ethereum.ContractClient, cognitoClient *aws.CognitoClient, dynamodbClient *aws.DynamoDBClient, handler HttpHandler) *server.Server {
	err := db.Migrator().AutoMigrate(models.Article{}, models.Document{})
	if err != nil {
		panic(err.(any))
	}

	endpoints := articles.NewEndpoints(articleService{DB: db, Contract: contract, CognitoClient: cognitoClient, DynamoDBClient: dynamodbClient})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (a articleService) Create(_ context.Context, request *articles.ArticleCreateRequest) (res *articles.ArticleResult, err error) {
	userID, err := a.CognitoClient.VerifyCognitoToken(request.Token)
	if err != nil {
		return nil, articles.MakeUnauthenticated(err)
	}

	// TODO: Give articles an id instead of an address, so that people without a wallet can create articles.
	userAddr, err := a.DynamoDBClient.GetAddressByID(userID)
	if err != nil {
		return nil, err
	}

	newArticle := models.NewArticle(request.Title, []byte(request.Content), userAddr)
	result := a.DB.Create(newArticle)
	return articleToResult(*newArticle), result.Error
}

func (a articleService) Read(_ context.Context, request *articles.ArticleReadRequest) (res *articles.ArticleResult, err error) {
	target := models.Article{ID: request.ID}
	result := a.DB.Preload("Document").First(&target)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articles.MakeNotFound(result.Error)
	}
	if result.Error != nil {
		return nil, result.Error
	}

	owner, err := a.Contract.GetOwnerAddressOf(target)
	if err != nil {
		return nil, err
	}

	return articleWithOwnerAddressToResult(target, *owner), nil
}

func (a articleService) Update(_ context.Context, request *articles.ArticleUpdateRequest) (res *articles.ArticleResult, err error) {
	userID, err := a.CognitoClient.VerifyCognitoToken(request.Token)
	if err != nil {
		return nil, articles.MakeUnauthenticated(err)
	}

	target := models.Article{ID: request.ID}

	err = a.DB.Transaction(func(tx *gorm.DB) error {
		result := tx.Preload("Document").First(&target)
		if result.Error != nil {
			return result.Error
		}

		err = a.AuthorizeEdit(userID, target, true)
		if err != nil {
			return err
		}

		target.Document.SetTitleIfPresent(request.Title)
		target.Document.SetContentIfPresent(request.Content)
		result = tx.Save(&target)

		return result.Error
	})

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, articles.MakeNotFound(err)
	}

	return articleToResult(target), err
}

func (a articleService) Delete(_ context.Context, request *articles.ArticleDeleteRequest) (res *articles.ArticleResult, err error) {
	userID, err := a.CognitoClient.VerifyCognitoToken(request.Token)
	if err != nil {
		return nil, articles.MakeUnauthenticated(err)
	}

	target := models.Article{ID: request.ID}
	result := a.DB.First(&target)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articles.MakeNotFound(result.Error)
	}

	err = a.AuthorizeEdit(userID, target, false)
	if err != nil {
		return nil, err
	}

	result = a.DB.Delete(&target)

	return articleIdToResult(request.ID), result.Error
}

func (a articleService) AuthorizeEdit(editorID string, target models.Article, requireNFT bool) error {
	isAuthorized := false
	editorAddr, err := a.DynamoDBClient.GetAddressByID(editorID)
	if err != nil {
		return err
	}

	if target.IsTokenized {
		owner, err := a.Contract.GetOwnerOfArticle(&bind.CallOpts{}, target.ID)
		if err != nil {
			return err
		}
		isAuthorized = editorAddr == owner.String()
	} else if !requireNFT {
		isAuthorized = editorAddr == target.OriginalAuthorAddress
	}

	if isAuthorized {
		return nil
	} else {
		msg := fmt.Sprintf(
			"Address %v (=User %v) does not have the right to do the specified operation on article %v.",
			editorAddr, editorID, target.ID)
		return articles.MakeUnauthorized(errors.New(msg))
	}
}

func articleToResult(src models.Article) *articles.ArticleResult {
	return &articles.ArticleResult{
		ID:      src.ID,
		Title:   src.Document.Title,
		Content: string(src.Document.Content),
	}
}

func articleIdToResult(src string) *articles.ArticleResult {
	return articles.NewArticleResult(&articlesviews.ArticleResult{
		Projected: &articlesviews.ArticleResultView{ID: &src},
		View:      "only-id",
	})
}

func articleWithOwnerAddressToResult(src models.Article, owner common.Address) *articles.ArticleResult {
	contentStr := string(src.Document.Content)
	ownerAddressStr := owner.String()
	return articles.NewArticleResult(&articlesviews.ArticleResult{
		Projected: &articlesviews.ArticleResultView{
			ID:           &src.ID,
			Title:        &src.Document.Title,
			Content:      &contentStr,
			OwnerAddress: &ownerAddressStr,
		},
		View: "with-owner-address",
	})
}
