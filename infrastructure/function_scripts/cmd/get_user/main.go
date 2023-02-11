package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"path"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	dynamodbTypes "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
)

func searchAttribute(attrs []types.AttributeType, key string) string {
	for _, attr := range attrs {
		if *attr.Name == key {
			return *attr.Value
		}
	}
	return ""
}

func handler(ctx context.Context, request events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {
	fmt.Printf("Get User: %#v\n", request)

	username := path.Base(request.RawPath)
	user, err := aws_utils.CognitoIdentityProviderClient.AdminGetUser(ctx, &cognitoidentityprovider.AdminGetUserInput{
		UserPoolId: &aws_utils.CognitoUserPoolId,
		Username:   &username,
	})
	if err != nil {
		return events.LambdaFunctionURLResponse{
			StatusCode: http.StatusNotFound,
			Body:       err.Error(),
		}, nil
	}

	biography := searchAttribute(user.UserAttributes, "custom:description")
	website := searchAttribute(user.UserAttributes, "website")
	picture := searchAttribute(user.UserAttributes, "picture")

	res, _ := aws_utils.DynamoDBClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: &aws_utils.DynamoDBUserTableName,
		Key: map[string]dynamodbTypes.AttributeValue{
			"user_id": &dynamodbTypes.AttributeValueMemberS{Value: username},
		},
		ProjectionExpression: aws.String("wallet_address"),
		ConsistentRead:       aws.Bool(true),
	})
	// `wallet_address` should exist after passing the `define` phase.
	address := res.Item["wallet_address"].(*dynamodbTypes.AttributeValueMemberS).Value

	userInfo := &models.PublicUserInfo{
		UserName:      *user.Username,
		Biography:     biography,
		Website:       website,
		Picture:       picture,
		WalletAddress: address,
	}

	jsonBody, _ := json.Marshal(userInfo)

	return events.LambdaFunctionURLResponse{
		StatusCode: http.StatusOK,
		Body:       string(jsonBody),
	}, nil
}

func main() {
	lambda.Start(handler)
}
