package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, event *events.CognitoEventUserPoolsVerifyAuthChallenge) (*events.CognitoEventUserPoolsVerifyAuthChallenge, error) {
	defer fmt.Printf("Verify Auth Challenge: %+v\n", event)

	res, err := aws_utils.DynamoDBClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: &aws_utils.DynamoDBUserTableName,
		Key: map[string]types.AttributeValue{
			"user_id": &types.AttributeValueMemberS{Value: event.UserName},
		},
		ProjectionExpression: aws.String("wallet_address"),
		ConsistentRead:       aws.Bool(true),
	})
	// `wallet_address` should exist after passing the `define` phase.
	address := res.Item["wallet_address"].(*types.AttributeValueMemberS).Value
	sign := event.Request.ChallengeAnswer.(string)
	signedData := event.Request.PrivateChallengeParameters["sign_message"]

	err = ethereum.VerifySignature(address, sign, signedData)
	if err == nil {
		event.Response = events.CognitoEventUserPoolsVerifyAuthChallengeResponse{AnswerCorrect: true}
	}
	return event, nil
}

func main() {
	lambda.Start(handler)
}
