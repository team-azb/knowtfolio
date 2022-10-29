package main

import (
	"crypto/rand"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event *events.CognitoEventUserPoolsCreateAuthChallenge) (*events.CognitoEventUserPoolsCreateAuthChallenge, error) {
	defer fmt.Printf("Create Auth Challenge: %+v\n", event)

	nonceBytes := make([]byte, 32)
	_, err := rand.Read(nonceBytes)
	if err != nil {
		return nil, fmt.Errorf("could not generate nonce")
	}

	signMessage := fmt.Sprintf("Sign in to Knowtfolio.\n(nonce: %x)", nonceBytes)
	event.Response.PublicChallengeParameters = map[string]string{"sign_message": signMessage}
	event.Response.PrivateChallengeParameters = map[string]string{"sign_message": signMessage}

	return event, nil
}

func main() {
	lambda.Start(handler)
}
