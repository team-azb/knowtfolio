package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/go-playground/validator/v10"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
	"net/http"
)

// checkDuplicateValueForField asks cognito if `value` is already used for user attribute `field`.
// If it is already used, `fieldError` with code `AlreadyExists` will be added to `fieldErrs`.
func checkDuplicateValueForField(ctx context.Context, field string, value string, fieldErrs *[]models.FieldError) error {
	res, err := aws_utils.CognitoClient.ListUsers(ctx, &cognitoidentityprovider.ListUsersInput{
		Filter:     aws.String(fmt.Sprintf(`%v = "%v"`, field, value)),
		UserPoolId: &aws_utils.CognitoUserPoolId,
	})
	if err != nil {
		return err
	}
	if len(res.Users) > 0 {
		*fieldErrs = append(*fieldErrs, models.FieldError{
			FieldName: field,
			Code:      models.AlreadyExists,
		})
	}
	return nil
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Printf("Validate Sign Up Form: %+v\n", request)

	var form models.SignUpForm
	fieldErrs := make([]models.FieldError, 0)

	// Validate request body format.
	err := json.Unmarshal([]byte(request.Body), &form)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       err.Error(),
		}, nil
	}
	err = models.SignUpFormValidator.Struct(form)
	if err != nil {
		if valErrs, ok := err.(validator.ValidationErrors); ok {
			for _, valErr := range valErrs {
				fieldErrs = append(fieldErrs, models.FieldError{
					FieldName: valErr.Field(),
					Code:      models.InvalidFormat,
				})
			}
		} else {
			return events.APIGatewayProxyResponse{}, err
		}
	}

	// Look for already-used fields.
	err = checkDuplicateValueForField(ctx, "username", form.UserName, &fieldErrs)
	if err != nil {
		return events.APIGatewayProxyResponse{}, err
	}
	err = checkDuplicateValueForField(ctx, "phone_number", form.PhoneNumber, &fieldErrs)
	if err != nil {
		return events.APIGatewayProxyResponse{}, err
	}

	// Check if `wallet_address` is already used.
	res, err := aws_utils.DynamoDBClient.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String("user_to_wallet"),
		IndexName:              aws.String("wallet_address-index"),
		Limit:                  aws.Int32(1),
		KeyConditionExpression: aws.String("wallet_address=:addr"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":addr": &types.AttributeValueMemberS{Value: form.WalletAddress},
		},
	})
	if err != nil {
		return events.APIGatewayProxyResponse{}, err
	}
	if res.Count != 0 {
		fieldErrs = append(fieldErrs, models.FieldError{
			FieldName: "wallet_address",
			Code:      models.AlreadyExists,
		})
	}

	jsonBody, _ := json.Marshal(fieldErrs)

	fmt.Printf("Response Body: %v\n", string(jsonBody))

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body:       string(jsonBody),
	}, nil
}

func main() {
	lambda.Start(handler)
}
