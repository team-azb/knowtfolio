package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event *events.CognitoEventUserPoolsCreateAuthChallenge) (*events.CognitoEventUserPoolsCreateAuthChallenge, error) {
	fmt.Printf("Create Auth Challenge: %+v\n", event)
	event.Response.PublicChallengeParameters = map[string]string{"hoge": "public"}
	event.Response.PrivateChallengeParameters = map[string]string{"fuga": "private"}
	return event, nil
}

func main() {
	lambda.Start(handler)
}
