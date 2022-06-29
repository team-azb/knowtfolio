package services

import (
	"context"
	"errors"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/articles"
	articlesviews "github.com/team-azb/knowtfolio/server/gateways/api/gen/articles/views"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/articles/server"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
)

type articleService struct {
	DB *gorm.DB
}

func NewArticlesService(db *gorm.DB, handler HttpHandler) *server.Server {
	err := db.Migrator().AutoMigrate(models.Article{})
	if err != nil {
		panic(err.(any))
	}

	endpoints := articles.NewEndpoints(articleService{DB: db})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (a articleService) Create(_ context.Context, request *articles.ArticleCreateRequest) (res *articles.ArticleResult, view string, err error) {
	newArticle := models.NewArticle(request.Title, []byte(request.Content))
	result := a.DB.Create(newArticle)
	return articleToResult(*newArticle), "default", result.Error
}

func (a articleService) Read(_ context.Context, id *articles.ArticleID) (res *articles.ArticleResult, view string, err error) {
	targetArticle := models.Article{ID: id.ID}
	result := a.DB.First(&targetArticle)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, "", articles.MakeNotFound(result.Error)
	}
	return articleToResult(targetArticle), "default", result.Error
}

func (a articleService) Update(_ context.Context, request *articles.ArticleUpdateRequest) (res *articles.ArticleResult, view string, err error) {
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

func (a articleService) Delete(_ context.Context, id *articles.ArticleID) (res *articles.ArticleResult, err error) {
	result := a.DB.Delete(&models.Article{ID: id.ID})
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articles.MakeNotFound(result.Error)
	}
	return articleIdToResult(id.ID), result.Error
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
