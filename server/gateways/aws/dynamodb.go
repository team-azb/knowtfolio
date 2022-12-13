package aws

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var userTableName = "user_to_wallet"

type DynamoDBClient struct {
	*dynamodb.Client
}

func NewDynamoDBClient() *DynamoDBClient {
	return &DynamoDBClient{Client: dynamodb.New(dynamodb.Options{
		Credentials: DefaultConfig.Credentials,
		Region:      Region,
	})}
}

func (c *DynamoDBClient) GetAddressByID(userID string) (string, error) {
	res, err := c.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: &userTableName,
		Key: map[string]types.AttributeValue{
			"user_id": &types.AttributeValueMemberS{Value: userID},
		},
		ProjectionExpression: aws.String("wallet_address"),
		ConsistentRead:       aws.Bool(true),
	})
	if err != nil {
		return "", err
	}

	address := res.Item["wallet_address"].(*types.AttributeValueMemberS).Value
	return address, nil
}

func (c *DynamoDBClient) PutUserWallet(userID string, walletAddress string) error {
	_, err := c.PutItem(context.Background(), &dynamodb.PutItemInput{
		Item: map[string]types.AttributeValue{
			"user_id":        &types.AttributeValueMemberS{Value: userID},
			"wallet_address": &types.AttributeValueMemberS{Value: walletAddress},
		},
		TableName: &userTableName,
	})
	return err
}

func (c *DynamoDBClient) DeleteUserWalletByID(userID string) error {
	_, err := c.DeleteItem(context.Background(), &dynamodb.DeleteItemInput{
		TableName: &userTableName,
		Key: map[string]types.AttributeValue{
			"user_id": &types.AttributeValueMemberS{Value: userID},
		},
	})
	return err
}
