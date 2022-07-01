package main

import (
	"github.com/team-azb/knowtfolio/server/services"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"net/http"
)

func main() {
	logger := services.NewLogger("main", true)

	handler := services.NewHttpHandler()
	db, err := gorm.Open(mysql.Open("root:password@tcp(localhost:3306)/knowtfolio-db?parseTime=true"))
	logger.Err(err)

	handler.AddService(services.NewArticlesService(db, *handler), "articles")
	handler.AddService(services.NewArticlesHtmlService(db, *handler), "articles-html")

	logger.Info().Msg("Starting backend server...")
	err = http.ListenAndServe(":8080", handler)
	logger.Err(err)
}
