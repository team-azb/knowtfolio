package main

import (
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event *events.CognitoEventUserPoolsDefineAuthChallenge) (*events.CognitoEventUserPoolsDefineAuthChallenge, error) {
	defer fmt.Printf("Define Auth Challenge: %+v\n", event)

	sessionLen := len(event.Request.Session)
	if sessionLen > 0 && event.Request.Session[sessionLen-1].ChallengeName == "CUSTOM_CHALLENGE" {
		if event.Request.Session[sessionLen-1].ChallengeResult {
			event.Response.IssueTokens = true
		} else {
			event.Response.FailAuthentication = true
		}
	} else {
		_, hasWallet := event.Request.UserAttributes["custom:wallet_address"]
		if hasWallet {
			event.Response.ChallengeName = "CUSTOM_CHALLENGE"
		} else {
			// Fail if the cognito user is not tied to a wallet.
			event.Response.FailAuthentication = true
		}
	}

	return event, nil
}

func main() {
	lambda.Start(handler)
}
