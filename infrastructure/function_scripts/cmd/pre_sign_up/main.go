package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	servicelambda "github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
)

type lambdaPayload struct {
	Body string `json:"body"`
}

func invokeValidationLambda(ctx context.Context, form models.SignUpForm) (fieldErrs []models.FieldError, internalErr error) {
	bodyJson, internalErr := json.Marshal(form)
	if internalErr != nil {
		return
	}
	payload, internalErr := json.Marshal(lambdaPayload{Body: string(bodyJson)})
	if internalErr != nil {
		return
	}

	res, internalErr := aws_utils.LambdaClient.Invoke(ctx, &servicelambda.InvokeInput{
		FunctionName: aws.String("validate_sign_up_form"),
		Payload:      payload,
	})
	if internalErr != nil {
		return
	}

	var resp lambdaPayload
	internalErr = json.Unmarshal(res.Payload, &resp)
	if internalErr != nil {
		return
	}
	internalErr = json.Unmarshal([]byte(resp.Body), &fieldErrs)
	if internalErr != nil {
		return
	}
	return
}

func handler(ctx context.Context, event *events.CognitoEventUserPoolsPreSignup) (*events.CognitoEventUserPoolsPreSignup, error) {
	fmt.Printf("Pre SignUp: %+v\n", event)

	password, ok := event.Request.ClientMetadata["password"]
	if !ok {
		return event, errors.New("clientMetadata must include `password` to validate on pre-signup phase")
	}

	form := models.SignUpForm{
		UserName:    event.UserName,
		Password:    password,
		PhoneNumber: event.Request.UserAttributes["phone_number"],
	}

	fieldErrs, internalErr := invokeValidationLambda(ctx, form)
	if internalErr != nil {
		return event, internalErr
	}
	if len(fieldErrs) > 0 {
		fieldErrsJson, _ := json.Marshal(fieldErrs)
		return event, fmt.Errorf("format error(s) found for signup form: %+v", string(fieldErrsJson))
	}

	return event, nil
}

func main() {
	lambda.Start(handler)
}
