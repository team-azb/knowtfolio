package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/go-playground/validator/v10"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
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
	err := models.ValidateJSONRequest([]byte(request.Body), &form)
	if err != nil {
		if valErrs, ok := err.(validator.ValidationErrors); ok {
			for _, valErr := range valErrs {
				fieldErrs = append(fieldErrs, models.FieldError{
					FieldName: valErr.Field(),
					Code:      models.InvalidFormat,
				})
			}
		} else {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusBadRequest,
				Body:       err.Error(),
			}, nil
		}
	}

	// Look for already-used fields.
	err = checkDuplicateValueForField(ctx, "username", form.UserName, &fieldErrs)
	if err != nil {
		return events.APIGatewayProxyResponse{}, err
	}
	err = checkDuplicateValueForField(ctx, "email", form.Email, &fieldErrs)
	if err != nil {
		return events.APIGatewayProxyResponse{}, err
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
