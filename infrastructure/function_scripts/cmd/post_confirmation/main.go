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

func handler(ctx context.Context, event *events.CognitoEventUserPoolsPostConfirmation) (*events.CognitoEventUserPoolsPostConfirmation, error) {
	fmt.Printf("Post Confirmation: %+v\n", event)

	_, err := aws_utils.DynamoDBClient.PutItem(ctx, &dynamodb.PutItemInput{
		Item: map[string]types.AttributeValue{
			"user_id":        &types.AttributeValueMemberS{Value: event.UserName},
			"wallet_address": &types.AttributeValueMemberS{Value: event.Request.UserAttributes["custom:wallet_address"]},
		},
		TableName:           aws.String("user_to_wallet"),
		ConditionExpression: aws.String("attribute_not_exists(wallet_address)"),
	})

	return event, err
}

func main() {
	lambda.Start(handler)
}
