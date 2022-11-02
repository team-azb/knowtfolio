package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	servicelambda "github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
	"net/http"
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

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	fmt.Printf("Sign Up: %+v\n", request)

	var form models.SignUpForm
	if err := json.Unmarshal([]byte(request.Body), &form); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       err.Error(),
		}, nil
	}

	fieldErrs, internalErr := invokeValidationLambda(ctx, form)
	if internalErr != nil {
		return events.APIGatewayProxyResponse{}, internalErr
	}
	if len(fieldErrs) > 0 {
		fieldErrsJson, _ := json.Marshal(fieldErrs)
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       string(fieldErrsJson),
		}, nil
	}

	_, err := aws_utils.CognitoClient.SignUp(ctx, form.ToCognitoInput())
	if err != nil {
		return events.APIGatewayProxyResponse{}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode:      http.StatusOK,
		IsBase64Encoded: false,
		Body:            "OK",
	}, nil
}

func main() {
	lambda.Start(handler)
}
