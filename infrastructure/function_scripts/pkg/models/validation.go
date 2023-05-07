package models

import (
	"encoding/json"
	"github.com/ethereum/go-ethereum/common"
	"reflect"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
)

var requestValidator = validator.New()

func init() {
	err := requestValidator.RegisterValidation("cognito_username", validateCognitoUserName)
	if err != nil {
		panic(err.(any))
	}

	err = requestValidator.RegisterValidation("cognito_password", validateCognitoPassword)
	if err != nil {
		panic(err.(any))
	}

	var validatable EthSignatureValidatable
	requestValidator.RegisterStructValidation(validateEthSignature, validatable)

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

func validateCognitoUserName(fl validator.FieldLevel) bool {
	val := fl.Field().String()
	containsValidCharactersOnly, _ := regexp.MatchString("^[0-9a-z\\-]+$", val)
	doesNotStartWithHyphen := !strings.HasPrefix(val, "-")
	doesNotEndWithHyphen := !strings.HasSuffix(val, "-")
	isLengthInRange := 1 <= len(val) && len(val) < 40

	return containsValidCharactersOnly &&
		doesNotStartWithHyphen &&
		doesNotEndWithHyphen &&
		isLengthInRange
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

// EthSignatureValidationInfo is a container for information necessary for eth-signature validation.
type EthSignatureValidationInfo struct {
	Address            common.Address
	Message            string
	Nonce              *common.Hash
	Signature          string
	SignatureFieldName string
}

type EthSignatureValidatable interface {
	ValidationInfo() (EthSignatureValidationInfo, error)
}

// validateEthSignature checks if the field value is a valid signature by the address specified in fl.Param().
func validateEthSignature(sl validator.StructLevel) {
	val, ok := sl.Current().Interface().(EthSignatureValidatable)
	if !ok {
		// This won't happen because `validateEthSignature` is registered only for `EthSignatureValidatable`.
		panic("Do not register `validateEthSignature` for types other than `EthSignatureValidatable`.")
	}

	valInfo, err := val.ValidationInfo()
	if err != nil {
		sl.ReportError(nil, "", "", "eth_sign_addr", "")
	}

	err = ethereum.VerifySignature(valInfo.Address.String(), valInfo.Signature, valInfo.Message, valInfo.Nonce)
	if err != nil {
		signatureField := reflect.ValueOf(val).FieldByName(valInfo.SignatureFieldName)
		sl.ReportError(signatureField, valInfo.SignatureFieldName, valInfo.SignatureFieldName, "eth_sign_addr", "")
	}
}
