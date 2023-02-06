package models

import (
	"encoding/json"
	"reflect"
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
)

var requestValidator = validator.New()

func init() {
	err := requestValidator.RegisterValidation("cognito_password", validateCognitoPassword)
	if err != nil {
		panic(err.(any))
	}

	err = requestValidator.RegisterValidation("eth_sign_addr", validateEthSignature)
	if err != nil {
		panic(err.(any))
	}

	requestValidator.RegisterTagNameFunc(func(field reflect.StructField) string {
		return field.Tag.Get("json")
	})
}

// ValidateJSONRequest unmarshal srcJSON into the type of distStruct,
// and then validate the struct using requestValidator.
func ValidateJSONRequest(srcJSON []byte, distStruct interface{}) error {
	err := json.Unmarshal(srcJSON, distStruct)
	if err != nil {
		return err
	}
	err = requestValidator.Struct(distStruct)
	return err
}

// validateCognitoPassword checks if the given field matches the cognito password policies:
// https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-policies.html#user-pool-settings-password-policies
func validateCognitoPassword(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	containsNumber, _ := regexp.MatchString("[0-9]", val)
	containsLowercase, _ := regexp.MatchString("[a-z]", val)
	containsUppercase, _ := regexp.MatchString("[A-Z]", val)
	containsSpecialCharacter, _ := regexp.MatchString("[\\^$*.[\\]{}()?\"!@#%&/\\\\,><':;|_~`=+\\-]", val)
	containsValidCharactersOnly, _ := regexp.MatchString("^[0-9a-zA-Z^$*.[\\]{}()?\"!@#%&/\\\\,><':;|_~`=+\\-]+$", val)
	isLengthInRange := 8 <= len(val) && len(val) <= 256

	return containsNumber &&
		containsLowercase &&
		containsUppercase &&
		containsSpecialCharacter &&
		containsValidCharactersOnly &&
		isLengthInRange
}

var signData = map[reflect.Type]string{
	reflect.TypeOf(SignUpForm{}):               "Sign up with wallet address",
	reflect.TypeOf(PostWalletAddressRequest{}): "Register wallet address",
}

// validateEthSignature checks if the field value is a valid signature by the address specified in fl.Param().
func validateEthSignature(fl validator.FieldLevel) bool {
	sign := fl.Field().String()

	addrVal, addrKind, _, isAddrFound := fl.GetStructFieldOK2()
	if addrKind != reflect.String && !isAddrFound {
		return false
	}
	addr := addrVal.String()

	err := ethereum.VerifySignature(addr, sign, signData[fl.Parent().Type()])

	return err == nil
}
