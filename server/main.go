package main

import (
	"context"
	awscfg "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
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
	if err != nil {
		logger.Fatal().Msgf("Failed to connect with Ethereum Network: %v", err)
	}
	contract, err := ethereum.NewContractClient(config.ContractAddress, client)
	if err != nil {
		logger.Fatal().Msgf("Failed to initialize with Contract Client: %v", err)
	}

	// Create S3 Client
	cfg, err := awscfg.LoadDefaultConfig(context.Background())
	if err != nil {
		logger.Fatal().Msgf("Failed to load AWS config: %v", err)
	}
	s3Client := s3.NewFromConfig(cfg)

	handler := services.NewHttpHandler()
	handler.AddService(services.NewArticlesService(db, contract, *handler), "articles")
	handler.AddService(services.NewArticlesHtmlService(db, *handler), "articles-html")
	handler.AddService(services.NewNftsService(db, contract, s3Client, *handler), "nfts")
	handler.AddService(services.NewSearchService(db, contract, *handler), "search")

	logger.Info().Msg("Starting backend server...")
	err = http.ListenAndServe(":8080", handler)
	logger.Err(err)
}
