package services

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/smithy-go"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/articles"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/articles/server"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"goa.design/goa/v3/security"
	"gorm.io/gorm"
)

type articleService struct {
	DB             *gorm.DB
	Contract       *ethereum.ContractClient
	CognitoClient  *aws.CognitoClient
	DynamoDBClient *aws.DynamoDBClient
}

const UserIDCtxKey = "userID"

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

func (a articleService) Create(ctx context.Context, request *articles.ArticleCreateRequest) (res *articles.ArticleResult, err error) {
	userID := ctx.Value(UserIDCtxKey).(string)

	newArticle := models.NewArticle(request.Title, []byte(request.Content), userID)
	result := a.DB.Create(newArticle)
	return articleToResult(newArticle), result.Error
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

	ownerAddr, err := a.Contract.GetOwnerAddressOf(target)
	if err != nil {
		return nil, err
	}

	if ownerAddr != nil {
		ownerID, err := a.DynamoDBClient.GetIDByAddress(*ownerAddr)
		if err != nil {
			return nil, err
		}
		return articleToResult(&target, withOwnerInfo(ownerID, ownerAddr)), nil
	} else {
		originalAuthorAddr, err := a.DynamoDBClient.GetAddressByID(target.OriginalAuthorID)
		if err != nil {
			var apiErr smithy.APIError
			if errors.As(err, &apiErr) && apiErr.ErrorCode() == aws.ItemNotFoundCode {
				originalAuthorAddr = nil
			} else {
				return nil, err
			}
		}
		return articleToResult(&target, withOwnerInfo(target.OriginalAuthorID, originalAuthorAddr)), nil
	}
}

func (a articleService) Update(ctx context.Context, request *articles.ArticleUpdateRequest) (res *articles.ArticleResult, err error) {
	userID := ctx.Value(UserIDCtxKey).(string)

	target := models.Article{ID: request.ID}

	err = a.DB.Transaction(func(tx *gorm.DB) error {
		result := tx.Preload("Document").First(&target)
		if result.Error != nil {
			return result.Error
		}

		err = a.AuthorizeEdit(userID, target, false)
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

	return articleToResult(&target), err
}

func (a articleService) Delete(ctx context.Context, request *articles.ArticleDeleteRequest) (res *articles.ArticleResult, err error) {
	userID := ctx.Value(UserIDCtxKey).(string)

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

	return articleToResult(&target), result.Error
}

func (a articleService) JWTAuth(ctx context.Context, token string, _ *security.JWTScheme) (context.Context, error) {
	userID, err := a.CognitoClient.VerifyCognitoToken(token)
	if err != nil {
		err = articles.MakeUnauthenticated(err)
	}
	return context.WithValue(ctx, UserIDCtxKey, userID), err
}

func (a articleService) AuthorizeEdit(editorID string, target models.Article, requireNFT bool) error {
	isAuthorized := false

	if target.IsTokenized {
		ownerAddr, err := a.Contract.GetOwnerOfArticle(&bind.CallOpts{}, target.ID)
		if err != nil {
			return err
		}
		ownerID, err := a.DynamoDBClient.GetIDByAddress(ownerAddr)
		if err != nil {
			return err
		}
		isAuthorized = editorID == ownerID
	} else if !requireNFT {
		isAuthorized = editorID == target.OriginalAuthorID
	}

	if isAuthorized {
		return nil
	} else {
		msg := fmt.Sprintf(
			"User %v does not have the right to execute the specified operation on article %v.",
			editorID, target.ID)
		return articles.MakeUnauthorized(errors.New(msg))
	}
}

type articleResultOpt func(articles.ArticleResult) articles.ArticleResult

func articleToResult(src *models.Article, opts ...articleResultOpt) *articles.ArticleResult {
	res := articles.ArticleResult{
		ID:      src.ID,
		Title:   src.Document.Title,
		Content: string(src.Document.SanitizedContent()),
	}
	for _, opt := range opts {
		res = opt(res)
	}
	return &res
}

func withOwnerInfo(id string, addr *common.Address) articleResultOpt {
	return func(res articles.ArticleResult) articles.ArticleResult {
		res.OwnerID = id
		if addr != nil {
			addrStr := addr.String()
			res.OwnerAddress = &addrStr
		}
		return res
	}
}
