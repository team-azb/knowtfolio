package services

import (
	"context"
	"errors"
	articleshtml "github.com/team-azb/knowtfolio/server/gateways/api/gen/articles_html"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/articles_html/server"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
)

type articleHtmlService struct {
	DB *gorm.DB
}

func NewArticlesHtmlService(db *gorm.DB, handler HttpHandler) *server.Server {
	endpoints := articleshtml.NewEndpoints(articleHtmlService{DB: db})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (a articleHtmlService) ReadHTML(_ context.Context, id *articleshtml.ArticleID) (res []byte, err error) {
	targetArticle := models.Article{ID: id.ID}

	result := a.DB.First(&targetArticle)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articleshtml.MakeNotFound(result.Error)
	}
	if result.Error != nil {
		return nil, result.Error
	}

	return targetArticle.ToHTML()
}
