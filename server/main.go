package main

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/joho/godotenv"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/services"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"net/http"
)

func main() {
	logger := services.NewLogger("main", true)

	// Load .env
	err := godotenv.Load()
	logger.Err(err)

	// Connect to DB
	db, err := gorm.Open(mysql.Open("root:password@tcp(db:3306)/knowtfolio-db?parseTime=true"), &gorm.Config{})
	if err != nil {
		logger.Fatal().Msgf("Failed to connect with DB: %v", err)
	}

	// Connect to Ethereum network
	client, err := ethclient.Dial(config.NetworkURI)
	logger.Err(err)
	contract, err := ethereum.NewContractClient(common.HexToAddress(config.ContractAddress), client)
	logger.Err(err)

	handler := services.NewHttpHandler()
	handler.AddService(services.NewArticlesService(db, *handler), "articles")
	handler.AddService(services.NewNftsService(db, contract, *handler), "nfts")
	handler.AddService(services.NewArticlesHtmlService(db, *handler), "articles-html")

	logger.Info().Msg("Starting backend server...")
	err = http.ListenAndServe(":8080", handler)
	logger.Err(err)
}
