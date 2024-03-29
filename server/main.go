package main

import (
	"context"
	awscfg "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/database"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/services"
	"net/http"
)

func main() {
	logger := services.NewLogger("main", true)

	// Connect to DB
	db, err := database.NewConnection()
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

	// Create AWS Clients
	cfg, err := awscfg.LoadDefaultConfig(context.Background())
	if err != nil {
		logger.Fatal().Msgf("Failed to load AWS config: %v", err)
	}
	s3Client := s3.NewFromConfig(cfg)
	dynamoDBClient := aws.NewDynamoDBClient()
	cognitoClient := aws.NewCognitoClient()

	handler := services.NewHttpHandler()
	handler.AddService(services.NewArticlesService(db, contract, cognitoClient, dynamoDBClient, *handler), "articles")
	handler.AddService(services.NewArticlesHtmlService(db, *handler), "articles-html")
	handler.AddService(services.NewNftsService(db, contract, s3Client, dynamoDBClient, *handler), "nfts")
	handler.AddService(services.NewSearchService(db, contract, dynamoDBClient, *handler), "search")
	handler.AddService(services.NewHealthcheckService(db, contract, *handler), "healthcheck")

	logger.Info().Msg("Starting backend server...")
	err = http.ListenAndServe(":8080", handler)
	logger.Err(err)
}
