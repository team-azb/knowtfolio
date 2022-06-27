package services

import (
	"context"
	"errors"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/article"
	articleviews "github.com/team-azb/knowtfolio/server/gateways/api/gen/article/views"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/article/server"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
)

type articleService struct {
	DB *gorm.DB
}

func NewArticleService(db *gorm.DB, handler HttpHandler) *server.Server {
	err := db.Migrator().AutoMigrate(models.Article{})
	if err != nil {
		panic(err.(any))
	}

	endpoints := article.NewEndpoints(articleService{DB: db})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (a articleService) Create(_ context.Context, request *article.ArticleCreateRequest) (res *article.ArticleResult, view string, err error) {
	newArticle := models.NewArticle(request.Title, []byte(request.Content))
	result := a.DB.Create(newArticle)
	return articleToResult(*newArticle), "default", result.Error
}

func (a articleService) Read(_ context.Context, id *article.ArticleID) (res *article.ArticleResult, view string, err error) {
	targetArticle := models.Article{ID: id.ID}
	result := a.DB.First(&targetArticle)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, "", article.MakeNotFound(result.Error)
	}
	return articleToResult(targetArticle), "default", result.Error
}

func (a articleService) Update(_ context.Context, request *article.ArticleUpdateRequest) (res *article.ArticleResult, view string, err error) {
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

	return articleToResult(targetArticle), "default", err
}

func (a articleService) Delete(_ context.Context, id *article.ArticleID) (res *article.ArticleResult, err error) {
	result := a.DB.Delete(&models.Article{ID: id.ID})
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, article.MakeNotFound(result.Error)
	}
	return articleIdToResult(id.ID), result.Error
}

func articleToResult(src models.Article) *article.ArticleResult {
	return &article.ArticleResult{
		ID:      src.ID,
		Title:   src.Title,
		Content: string(src.Content),
	}
}

func articleIdToResult(src string) *article.ArticleResult {
	return article.NewArticleResult(&articleviews.ArticleResult{
		Projected: &articleviews.ArticleResultView{ID: &src},
		View:      "only-id",
	})
}
