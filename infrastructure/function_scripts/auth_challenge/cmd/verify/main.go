package main

import (
	"errors"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(event *events.CognitoEventUserPoolsVerifyAuthChallenge) (*events.CognitoEventUserPoolsVerifyAuthChallenge, error) {
	defer fmt.Printf("Verify Auth Challenge: %+v\n", event)

	// `custom:wallet_address` should exist after passing the `define` phase.
	address := event.Request.UserAttributes["custom:wallet_address"]
	sign := event.Request.ChallengeAnswer.(string)
	signedData := event.Request.PrivateChallengeParameters["sign_message"]

	err := verifySignature(address, sign, signedData)
	if err == nil {
		event.Response = events.CognitoEventUserPoolsVerifyAuthChallengeResponse{AnswerCorrect: true}
	}
	return event, nil
}

// verifySignature checks if `sign` is a signature that is signed by `addr` using `signedData`.
func verifySignature(addr string, sign string, signedData string) error {
	decodedSign, err := hexutil.Decode(sign)
	if err != nil {
		return err
	}

	// NOTE: Some client generates 27/28 instead of 0/1 due to Legacy Ethereum
	// ref) https://github.com/ethereum/go-ethereum/issues/19751#issuecomment-504900739
	if decodedSign[crypto.RecoveryIDOffset] >= 27 {
		decodedSign[crypto.RecoveryIDOffset] -= 27
	}

	hash := accounts.TextHash([]byte(signedData))
	pubKey, err := crypto.SigToPub(hash, decodedSign)
	if err != nil {
		return err
	}

	signedAddr := crypto.PubkeyToAddress(*pubKey)
	if addr != signedAddr.String() {
		return errors.New("`address` didn't match the signer")
	}

	return nil
}

func main() {
	lambda.Start(handler)
}
