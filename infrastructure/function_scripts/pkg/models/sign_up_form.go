package models

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
)

type SignUpForm struct {
	UserName      string `json:"username" validate:"required"`
	Password      string `json:"password" validate:"required,cognito_password"`
	PhoneNumber   string `json:"phone_number" validate:"required,e164"`
	WalletAddress string `json:"wallet_address" validate:"omitempty,eth_addr"`
	Signature     string `json:"signature" validate:"required_with=WalletAddress,eth_sign_addr=WalletAddress"`
}

func (f *SignUpForm) ToCognitoInput() *cognitoidentityprovider.SignUpInput {
	return &cognitoidentityprovider.SignUpInput{
		Username: &f.UserName,
		Password: &f.Password,
		UserAttributes: []types.AttributeType{
			{
				Name:  aws.String("phone_number"),
				Value: aws.String(f.PhoneNumber),
			},
			{
				Name:  aws.String("custom:wallet_address"),
				Value: aws.String(f.WalletAddress),
			},
		},
		ClientId: &aws_utils.CognitoClientId,
	}
}
