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
)

func handler(ctx context.Context, event *events.CognitoEventUserPoolsDefineAuthChallenge) (*events.CognitoEventUserPoolsDefineAuthChallenge, error) {
	defer fmt.Printf("Define Auth Challenge: %+v\n", event)

	sessionLen := len(event.Request.Session)
	if sessionLen > 0 && event.Request.Session[sessionLen-1].ChallengeName == "CUSTOM_CHALLENGE" {
		if event.Request.Session[sessionLen-1].ChallengeResult {
			event.Response.IssueTokens = true
		} else {
			event.Response.FailAuthentication = true
		}
	} else {
		res, err := aws_utils.DynamoDBClient.GetItem(ctx, &dynamodb.GetItemInput{
			TableName: &aws_utils.DynamoDBUserTableName,
			Key: map[string]types.AttributeValue{
				"user_id": &types.AttributeValueMemberS{Value: event.UserName},
			},
			ProjectionExpression: aws.String("wallet_address"),
			ConsistentRead:       aws.Bool(true),
		})
		if err != nil {
			return nil, err
		}
		_, hasWallet := res.Item["wallet_address"]
		if hasWallet {
			event.Response.ChallengeName = "CUSTOM_CHALLENGE"
		} else {
			// Fail if the cognito user is not tied to a wallet.
			event.Response.FailAuthentication = true
		}
	}

	return event, nil
}

func main() {
	lambda.Start(handler)
}
