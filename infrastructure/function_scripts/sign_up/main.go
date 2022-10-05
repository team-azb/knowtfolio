package main

import (
	"context"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
)

type SignUpEvent struct {
	Username      string `json:"username"`
	Password      string `json:"password"`
	PhoneNumber   string `json:"phone_number"`
	WalletAddress string `json:"wallet_address"`
}

func handler(ctx context.Context, event SignUpEvent) (string, error) {
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
				Value: aws.String(event.PhoneNumber),
			},
			{
				Name:  aws.String("custom:wallet_address"),
				Value: aws.String(event.WalletAddress),
			},
		},
	}

	newUserData.SetUserPoolId(os.Getenv("USER_POOL_ID"))
	newUserData.SetUsername(event.Username)

	_, err := cognitoClient.AdminCreateUser(newUserData)
	if err != nil {
		return "Got error creating user:", err
	}

	return "OK", nil
}

func main() {
	lambda.Start(handler)
}
