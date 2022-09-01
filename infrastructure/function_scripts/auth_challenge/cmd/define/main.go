package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event *events.CognitoEventUserPoolsDefineAuthChallenge) (*events.CognitoEventUserPoolsDefineAuthChallenge, error) {
	fmt.Printf("Define Auth Challenge: %+v\n", event)

	sessionLen := len(event.Request.Session)
	if sessionLen > 0 && event.Request.Session[sessionLen-1].ChallengeResult {
		event.Response.IssueTokens = true
	} else {
		event.Response.ChallengeName = "SIGNATURE_CHALLENGE"
	}

	return event, nil
}

func main() {
	lambda.Start(handler)
}
