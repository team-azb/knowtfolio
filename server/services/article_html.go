package services

import (
	"context"
	"errors"
	articlehtml "github.com/team-azb/knowtfolio/server/gateways/api/gen/article_html"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/article_html/server"
	"github.com/team-azb/knowtfolio/server/models"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
)

type articleHtmlService struct {
	DB *gorm.DB
}

func NewArticleHtmlService(db *gorm.DB, handler HttpHandler) *server.Server {
	endpoints := articlehtml.NewEndpoints(articleHtmlService{DB: db})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (a articleHtmlService) ReadHTML(_ context.Context, id *articlehtml.ArticleID) (res []byte, err error) {
	targetArticle := models.Article{ID: id.ID}

	result := a.DB.First(&targetArticle)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, articlehtml.MakeNotFound(result.Error)
	}
	if result.Error != nil {
		return nil, result.Error
	}

	return targetArticle.ToHTML()
}
