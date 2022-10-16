package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

type SignUpForm struct {
	Username      string `json:"username"`
	Password      string `json:"password"`
	PhoneNumber   string `json:"phone_number"`
	WalletAddress string `json:"wallet_address"`
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var signUpForm SignUpForm
	userPoolId := os.Getenv("USER_POOL_ID")
	clientId := os.Getenv("CLIENT_ID")
	if err := json.Unmarshal([]byte(request.Body), &signUpForm); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode:      http.StatusBadRequest,
			IsBase64Encoded: false,
			Body:            err.Error(),
		}, nil
	}
	// Initialize a session that the SDK will use to load
	// credentials from the shared credentials file ~/.aws/credentials.
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	cognitoClient := cognitoidentityprovider.New(sess)

	query := fmt.Sprintf("phone_number = \"%s\"", signUpForm.PhoneNumber)
	output, err := cognitoClient.ListUsers(&cognitoidentityprovider.ListUsersInput{Filter: &query, UserPoolId: &userPoolId})
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode:      http.StatusInternalServerError,
			IsBase64Encoded: false,
			Body:            err.Error(),
		}, nil
	}

	if len(output.Users) > 0 {
		return events.APIGatewayProxyResponse{
			StatusCode:      http.StatusBadRequest,
			IsBase64Encoded: false,
			Body:            "PhoneNumberExistsException: The phone number is already registered",
		}, nil
	}

	newUserData := &cognitoidentityprovider.SignUpInput{
		UserAttributes: []*cognitoidentityprovider.AttributeType{
			{
				Name:  aws.String("phone_number"),
				Value: aws.String(signUpForm.PhoneNumber),
			},
			{
				Name:  aws.String("custom:wallet_address"),
				Value: aws.String(signUpForm.WalletAddress),
			},
		},
		ClientId: &clientId,
		Username: &signUpForm.Username,
		Password: &signUpForm.Password,
	}

	_, err = cognitoClient.SignUp(newUserData)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode:      http.StatusBadRequest,
			IsBase64Encoded: false,
			Body:            err.Error(),
		}, nil
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
