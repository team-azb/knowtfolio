package models

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
)

type SignUpForm struct {
	UserName string `json:"username" validate:"required,cognito_username"`
	Password string `json:"password" validate:"required,cognito_password"`
	Email    string `json:"email" validate:"required,email"`
}

func (f *SignUpForm) ToCognitoInput() *cognitoidentityprovider.SignUpInput {
	return &cognitoidentityprovider.SignUpInput{
		Username: &f.UserName,
		Password: &f.Password,
		UserAttributes: []types.AttributeType{
			{
				Name:  aws.String("email"),
				Value: aws.String(f.Email),
			},
		},
		ClientId: &aws_utils.CognitoClientId,
	}
}
