package main

import (
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
)

func handler(event *events.CognitoEventUserPoolsCreateAuthChallenge) (*events.CognitoEventUserPoolsCreateAuthChallenge, error) {
	defer fmt.Printf("Create Auth Challenge: %+v\n", event)

	message := "Sign in to Knowtfolio."
	nonce, err := ethereum.GenerateNonce()
	if err != nil {
		return nil, fmt.Errorf("could not generate nonce")
	}
	signData := ethereum.GenerateSignData(message, nonce)
	event.Response.PublicChallengeParameters = map[string]string{"sign_message": signData}
	event.Response.PrivateChallengeParameters = map[string]string{"message": message, "nonce": nonce.Hex()}

	return event, nil
}

func main() {
	lambda.Start(handler)
}
