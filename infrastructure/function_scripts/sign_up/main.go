package main

import (
	"context"
	"encoding/json"
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
	if err := json.Unmarshal([]byte(request.Body), &signUpForm); err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode:      http.StatusBadRequest,
			IsBase64Encoded: false,
			Body:            err.Error(),
		}, nil
	}
	// Initialize a session that the SDK will use to load
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	cognitoClient := cognitoidentityprovider.New(sess)

	newUserData := &cognitoidentityprovider.AdminCreateUserInput{
		DesiredDeliveryMediums: []*string{
			aws.String("SMS"),
		},
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
	}

	newUserData.SetUserPoolId(os.Getenv("USER_POOL_ID"))
	newUserData.SetUsername(signUpForm.Username)

	_, err := cognitoClient.AdminCreateUser(newUserData)
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
