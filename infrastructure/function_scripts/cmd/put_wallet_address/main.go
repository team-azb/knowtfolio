package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
	"net/http"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Printf("Put Wallet Address: %+v\n", request)

	var req models.PutWalletAddressRequest

	// Validate request body format.
	err := models.ValidateJSONRequest([]byte(request.Body), &req)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       err.Error(),
		}, nil
	}

	_, err = aws_utils.DynamoDBClient.PutItem(ctx, &dynamodb.PutItemInput{
		Item: map[string]types.AttributeValue{
			"user_id":        &types.AttributeValueMemberS{Value: req.UserID},
			"wallet_address": &types.AttributeValueMemberS{Value: req.WalletAddress},
		},
		TableName:           &aws_utils.DynamoDBUserTableName,
		ConditionExpression: aws.String("attribute_not_exists(wallet_address)"),
	})

	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       err.Error(),
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
	}, nil
}

func main() {
	lambda.Start(handler)
}
