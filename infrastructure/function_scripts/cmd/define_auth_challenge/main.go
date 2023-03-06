package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/smithy-go"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
)

func handler(_ context.Context, event *events.CognitoEventUserPoolsDefineAuthChallenge) (*events.CognitoEventUserPoolsDefineAuthChallenge, error) {
	defer fmt.Printf("Define Auth Challenge: %+v\n", event)

	sessionLen := len(event.Request.Session)
	if sessionLen > 0 && event.Request.Session[sessionLen-1].ChallengeName == "CUSTOM_CHALLENGE" {
		if event.Request.Session[sessionLen-1].ChallengeResult {
			event.Response.IssueTokens = true
		} else {
			event.Response.FailAuthentication = true
		}
	} else {
		dynamodb := aws.NewDynamoDBClient()
		_, err := dynamodb.GetAddressByID(event.UserName)
		if err != nil {
			var apiErr smithy.APIError
			if errors.As(err, &apiErr) && apiErr.ErrorCode() == aws.ItemNotFoundCode {
				// Address not registered.
				event.Response.FailAuthentication = true
			} else {
				return nil, err
			}
		} else {
			event.Response.ChallengeName = "CUSTOM_CHALLENGE"
		}
	}

	return event, nil
}

func main() {
	lambda.Start(handler)
}
