package aws

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/ethereum/go-ethereum/common"
)

const (
	userTableName        = "user_to_wallet"
	addressToIDIndexName = "wallet_address-index"
)

type DynamoDBClient struct {
	*dynamodb.Client
}

func NewDynamoDBClient() *DynamoDBClient {
	return &DynamoDBClient{Client: dynamodb.New(dynamodb.Options{
		Credentials: DefaultConfig.Credentials,
		Region:      Region,
	})}
}

func (c *DynamoDBClient) GetAddressByID(userID string) (*common.Address, error) {
	res, err := c.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String(userTableName),
		Key: map[string]types.AttributeValue{
			"user_id": &types.AttributeValueMemberS{Value: userID},
		},
		ProjectionExpression: aws.String("wallet_address"),
		ConsistentRead:       aws.Bool(true),
	})
	if err != nil {
		return nil, err
	}

	if item, ok := res.Item["wallet_address"]; ok {
		addr := common.HexToAddress(item.(*types.AttributeValueMemberS).Value)
		return &addr, nil
	} else {
		// user_id not found or the user doesn't have a wallet_address
		return nil, nil
	}
}

func (c *DynamoDBClient) GetIDByAddress(walletAddress common.Address) (string, error) {
	res, err := c.Query(context.Background(), &dynamodb.QueryInput{
		TableName:              aws.String(userTableName),
		IndexName:              aws.String(addressToIDIndexName),
		KeyConditionExpression: aws.String("wallet_address = :wallet_address_value"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":wallet_address_value": &types.AttributeValueMemberS{Value: walletAddress.String()},
		},
		Limit:                aws.Int32(1),
		ProjectionExpression: aws.String("user_id"),
	})
	if err != nil {
		return "", err
	}
	if res.Count == 0 {
		return "", errors.New(fmt.Sprintf("wallet address %s not found", walletAddress))
	}

	id := res.Items[0]["user_id"].(*types.AttributeValueMemberS).Value
	return id, nil
}

func (c *DynamoDBClient) PutUserWallet(userID string, walletAddress string) error {
	_, err := c.PutItem(context.Background(), &dynamodb.PutItemInput{
		Item: map[string]types.AttributeValue{
			"user_id":        &types.AttributeValueMemberS{Value: userID},
			"wallet_address": &types.AttributeValueMemberS{Value: walletAddress},
		},
		TableName: aws.String(userTableName),
	})
	return err
}

func (c *DynamoDBClient) DeleteUserWalletByID(userID string) error {
	_, err := c.DeleteItem(context.Background(), &dynamodb.DeleteItemInput{
		TableName: aws.String(userTableName),
		Key: map[string]types.AttributeValue{
			"user_id": &types.AttributeValueMemberS{Value: userID},
		},
	})
	return err
}
