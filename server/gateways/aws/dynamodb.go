package aws

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/smithy-go"
	"github.com/ethereum/go-ethereum/common"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
)

const tableName = "knowtfolio"

type KeyValueType string

const (
	userIDToWalletAddressType KeyValueType = "user_id_to_wallet_address"
	userIDToNonceType         KeyValueType = "user_id_to_nonce"
	walletAddressToUserIDType KeyValueType = "wallet_address_to_user_id"
)

const (
	ItemNotFoundCode                = "ItemNotFound"
	ValueFieldNotFoundCode          = "ValueFieldNotFound"
	UserAlreadyHasWalletAddressCode = "UserAlreadyHaveWalletAddress"
	WalletAddressAlreadyUsedCode    = "WalletAddressAlreadyUsed"
	NonceGenerationFailedCode       = "NonceGenerationFailed"
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
	addrStr, err := c.getValue(userIDToWalletAddressType, userID)
	if err != nil {
		return nil, err
	}
	addr := common.HexToAddress(addrStr)
	return &addr, nil
}

func (c *DynamoDBClient) GetNonceByID(userID string) (*common.Hash, error) {
	addrStr, err := c.getValue(userIDToNonceType, userID)
	if err != nil {
		return nil, err
	}
	nonce := common.HexToHash(addrStr)
	return &nonce, nil
}

// GetAndReplaceNonceByID gets the current nonce and then replace it with a newly generated one.
// This can be done by a single PutItem call with ReturnValues set to ALL_OLD.
func (c *DynamoDBClient) GetAndReplaceNonceByID(userID string) (*common.Hash, error) {
	nonce, err := ethereum.GenerateNonce()
	if err != nil {
		return nil, &smithy.GenericAPIError{
			Code:    NonceGenerationFailedCode,
			Message: err.Error(),
			Fault:   smithy.FaultServer,
		}
	}

	res, err := c.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			"type":  &types.AttributeValueMemberS{Value: string(userIDToNonceType)},
			"key":   &types.AttributeValueMemberS{Value: userID},
			"value": &types.AttributeValueMemberS{Value: nonce.Hex()},
		},
		ReturnValues: types.ReturnValueAllOld,
	})

	if val, ok := res.Attributes["value"]; ok {
		oldNonce := common.HexToHash(val.(*types.AttributeValueMemberS).Value)
		return &oldNonce, nil
	} else {
		return nil, &smithy.GenericAPIError{
			Code:    ValueFieldNotFoundCode,
			Message: fmt.Sprintf("`value` field for %s/%s not found", userIDToNonceType, userID),
			Fault:   smithy.FaultServer,
		}
	}
}

func (c *DynamoDBClient) GetIDByAddress(walletAddress common.Address) (string, error) {
	return c.getValue(walletAddressToUserIDType, walletAddress.String())
}

func (c *DynamoDBClient) GenerateAndPutNonce(userID string) error {
	nonce, err := ethereum.GenerateNonce()
	if err != nil {
		return &smithy.GenericAPIError{
			Code:    NonceGenerationFailedCode,
			Message: err.Error(),
			Fault:   smithy.FaultServer,
		}
	}

	_, err = c.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item: map[string]types.AttributeValue{
			"type":  &types.AttributeValueMemberS{Value: string(userIDToNonceType)},
			"key":   &types.AttributeValueMemberS{Value: userID},
			"value": &types.AttributeValueMemberS{Value: nonce.Hex()},
		},
		ReturnValues: types.ReturnValueAllOld,
	})
	return err
}

func (c *DynamoDBClient) PutUserWallet(userID string, walletAddress string) error {
	keyValueToItem := func(kvType KeyValueType, key string, value string) types.TransactWriteItem {
		return types.TransactWriteItem{
			Put: &types.Put{
				TableName:           aws.String(tableName),
				ConditionExpression: aws.String("attribute_not_exists(#key)"),
				Item: map[string]types.AttributeValue{
					"type":  &types.AttributeValueMemberS{Value: string(kvType)},
					"key":   &types.AttributeValueMemberS{Value: key},
					"value": &types.AttributeValueMemberS{Value: value},
				},
				ReturnValuesOnConditionCheckFailure: types.ReturnValuesOnConditionCheckFailureAllOld,
				// NOTE: Need to define this to avoid collision with reserved words at `ConditionExpression`.
				// See https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
				ExpressionAttributeNames: map[string]string{
					"#key": "key",
				},
			},
		}
	}

	nonce, err := ethereum.GenerateNonce()
	if err != nil {
		return &smithy.GenericAPIError{
			Code:    NonceGenerationFailedCode,
			Message: err.Error(),
			Fault:   smithy.FaultServer,
		}
	}

	_, err = c.TransactWriteItems(context.Background(), &dynamodb.TransactWriteItemsInput{
		TransactItems: []types.TransactWriteItem{
			keyValueToItem(userIDToWalletAddressType, userID, walletAddress),
			keyValueToItem(userIDToNonceType, userID, nonce.Hex()),
			keyValueToItem(walletAddressToUserIDType, walletAddress, userID),
		},
	})

	// Parse transaction error.
	// `TransactionCanceledException` contains an error for each action in the transaction.
	var apiErr smithy.APIError
	if errors.As(err, &apiErr) {
		if canceledErr, ok := apiErr.(*types.TransactionCanceledException); ok {
			for _, reason := range canceledErr.CancellationReasons {
				if reason.Code == nil {
					continue
				}
				if *reason.Code == "ConditionalCheckFailed" {
					switch reason.Item["type"].(*types.AttributeValueMemberS).Value {
					case string(userIDToWalletAddressType), string(userIDToNonceType):
						return &smithy.GenericAPIError{
							Code:    UserAlreadyHasWalletAddressCode,
							Message: *reason.Message,
							Fault:   smithy.FaultClient,
						}
					case string(walletAddressToUserIDType):
						return &smithy.GenericAPIError{
							Code:    WalletAddressAlreadyUsedCode,
							Message: *reason.Message,
							Fault:   smithy.FaultClient,
						}
					}
				}
			}
		}
	}
	return err
}

func (c *DynamoDBClient) DeleteUserWalletByID(userID string) error {
	walletAddress, err := c.GetAddressByID(userID)
	if err != nil {
		return err
	}

	keyToItem := func(kvType KeyValueType, key string) types.TransactWriteItem {
		return types.TransactWriteItem{
			Delete: &types.Delete{
				TableName: aws.String(tableName),
				Key: map[string]types.AttributeValue{
					"type": &types.AttributeValueMemberS{Value: string(kvType)},
					"key":  &types.AttributeValueMemberS{Value: key},
				},
			},
		}
	}

	_, err = c.TransactWriteItems(context.Background(), &dynamodb.TransactWriteItemsInput{
		TransactItems: []types.TransactWriteItem{
			keyToItem(userIDToWalletAddressType, userID),
			keyToItem(userIDToNonceType, userID),
			keyToItem(walletAddressToUserIDType, walletAddress.String()),
		},
	})
	return err
}

func (c *DynamoDBClient) getValue(kvType KeyValueType, key string) (string, error) {
	res, err := c.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"type": &types.AttributeValueMemberS{Value: string(kvType)},
			"key":  &types.AttributeValueMemberS{Value: key},
		},
		ProjectionExpression: aws.String("#value"),
		ExpressionAttributeNames: map[string]string{
			"#value": "value",
		},
		ConsistentRead: aws.Bool(true),
	})
	if err != nil {
		return "", err
	}
	if res.Item == nil {
		// Value not found
		return "", &smithy.GenericAPIError{
			Code:    ItemNotFoundCode,
			Message: fmt.Sprintf("item for %s/%s not found", kvType, key),
			Fault:   smithy.FaultClient,
		}
	}

	if item, ok := res.Item["value"]; ok {
		return item.(*types.AttributeValueMemberS).Value, nil
	} else {
		return "", &smithy.GenericAPIError{
			Code:    ValueFieldNotFoundCode,
			Message: fmt.Sprintf("`value` field for %s/%s not found", kvType, key),
			Fault:   smithy.FaultServer,
		}
	}
}
