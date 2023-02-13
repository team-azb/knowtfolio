package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/smithy-go"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
	awsutil "github.com/team-azb/knowtfolio/server/gateways/aws"
	"net/http"
	"strings"
)

var cognitoClient = awsutil.NewCognitoClient()

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Printf("Put Wallet Address: %+v\n", request)

	authHeader, ok := request.Headers["authorization"]
	if !ok {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
			Body:       "authorization header is required",
		}, nil
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	tokenUserID, err := cognitoClient.VerifyCognitoToken(token)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusUnauthorized,
			Body:       "invalid token",
		}, nil
	}

	var req models.PostWalletAddressRequest

	// Validate request body format.
	err = models.ValidateJSONRequest([]byte(request.Body), &req)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       err.Error(),
		}, nil
	}
	if req.UserID != tokenUserID {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusForbidden,
			Body:       fmt.Sprintf("user [%v] cannot register user [%v]'s wallet address", tokenUserID, req.UserID),
		}, nil
	}

	_, err = aws_utils.DynamoDBClient.PutItem(ctx, &dynamodb.PutItemInput{
		Item: map[string]types.AttributeValue{
			"user_id":        &types.AttributeValueMemberS{Value: req.UserID},
			"wallet_address": &types.AttributeValueMemberS{Value: req.WalletAddress},
		},
		TableName: &aws_utils.DynamoDBUserTableName,
		ConditionExpression: aws.String(
			"attribute_not_exists(user_id) AND attribute_not_exists(wallet_address)"),
	})

	if err != nil {
		var apiErr smithy.APIError
		if errors.As(err, &apiErr) && apiErr.ErrorCode() == "ConditionalCheckFailedException" {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusBadRequest,
				Body:       apiErr.ErrorMessage(),
			}, nil
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
