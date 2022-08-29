package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event *events.CognitoEventUserPoolsDefineAuthChallenge) (*events.CognitoEventUserPoolsDefineAuthChallenge, error) {
	fmt.Printf("Define Auth Challenge: %+v\n", event)
	event.Response.ChallengeName = "CUSTOM_AUTH"
	event.Response.IssueTokens = true
	return event, nil
}

func main() {
	lambda.Start(handler)
}
