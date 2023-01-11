package models

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/go-playground/validator/v10"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"reflect"
	"regexp"
)

var (
	SignUpFormValidator = validator.New()
)

func init() {
	err := SignUpFormValidator.RegisterValidation("cognito_password", validateCognitoPassword)
	SignUpFormValidator.RegisterTagNameFunc(func(field reflect.StructField) string {
		return field.Tag.Get("json")
	})
	if err != nil {
		panic(err.(any))
	}
}

// validateCognitoPassword checks if the given field matches the cognito password policies:
// https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-policies.html#user-pool-settings-password-policies
func validateCognitoPassword(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	containsNumber, _ := regexp.MatchString("[0-9]", val)
	containsLowercase, _ := regexp.MatchString("[a-z]", val)
	containsUppercase, _ := regexp.MatchString("[A-Z]", val)
	containsSpecialCharacter, _ := regexp.MatchString("[^$*.[\\]{}()?\"!@#%&/\\\\,><':;|_~`=+\\-]", val)
	containsValidCharactersOnly, _ := regexp.MatchString("^[0-9a-zA-Z^$*.[\\]{}()?\"!@#%&/\\\\,><':;|_~`=+\\-]+$", val)
	isLengthInRange := 8 <= len(val) && len(val) <= 256

	return containsNumber &&
		containsLowercase &&
		containsUppercase &&
		containsSpecialCharacter &&
		containsValidCharactersOnly &&
		isLengthInRange
}

type SignUpForm struct {
	UserName      string `json:"username" validate:"required"`
	Password      string `json:"password" validate:"required,cognito_password"`
	PhoneNumber   string `json:"phone_number" validate:"required,e164"`
	WalletAddress string `json:"wallet_address" validate:"omitempty,eth_addr"`
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
