package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event *events.CognitoEventUserPoolsVerifyAuthChallenge) (*events.CognitoEventUserPoolsVerifyAuthChallenge, error) {
	fmt.Printf("Verify Auth Challenge: %+v\n", event)
	event.Response = events.CognitoEventUserPoolsVerifyAuthChallengeResponse{AnswerCorrect: true}
	return event, nil
}

func main() {
	lambda.Start(handler)
}
