package main

import (
	"context"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(_ context.Context, event *events.CognitoEventUserPoolsVerifyAuthChallenge) (*events.CognitoEventUserPoolsVerifyAuthChallenge, error) {
	defer fmt.Printf("Verify Auth Challenge: %+v\n", event)

	dynamoDB := aws.NewDynamoDBClient()
	// `wallet_address` should exist after passing the `define` phase.
	address, err := dynamoDB.GetAddressByID(event.UserName)
	if err != nil {
		return nil, err
	}

	sign := event.Request.ChallengeAnswer.(string)
	message := event.Request.PrivateChallengeParameters["message"]
	nonceStr := event.Request.PrivateChallengeParameters["nonce"]

	nonce := common.HexToHash(nonceStr)
	err = ethereum.VerifySignature(address.String(), sign, message, &nonce)
	if err == nil {
		event.Response = events.CognitoEventUserPoolsVerifyAuthChallengeResponse{AnswerCorrect: true}
	}
	return event, nil
}

func main() {
	lambda.Start(handler)
}
