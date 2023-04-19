package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/smithy-go"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"net/http"
)

func handler(_ context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Printf("Put Wallet Address: %+v\n", request)

	var req models.PostWalletAddressRequest

	// Validate request body format.
	err := models.ValidateJSONRequest([]byte(request.Body), &req)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       err.Error(),
		}, nil
	}

	dynamoDB := aws.NewDynamoDBClient()
	err = dynamoDB.PutUserWallet(req.UserID, req.WalletAddress)
	if err != nil {
		var apiErr smithy.APIError
		if errors.As(err, &apiErr) {
			switch apiErr.ErrorCode() {
			case aws.UserAlreadyHasWalletAddressCode:
				return events.APIGatewayProxyResponse{
					StatusCode: http.StatusBadRequest,
					Body:       "user already has a wallet address registered",
				}, nil
			case aws.WalletAddressAlreadyUsedCode:
				return events.APIGatewayProxyResponse{
					StatusCode: http.StatusBadRequest,
					Body:       "wallet address is already used",
				}, nil
			}
		}
		return events.APIGatewayProxyResponse{}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}

func main() {
	lambda.Start(handler)
}
