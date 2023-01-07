package models

import (
	"github.com/go-playground/validator/v10"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"reflect"
)

func init() {
	err := requestValidator.RegisterValidation("eth_sign_addr", validateEthSignature)
	if err != nil {
		panic(err.(any))
	}
}

const signData = "Update Wallet Address"

// validateEthSignature checks if the field value is a valid signature by the address specified in fl.Param().
func validateEthSignature(fl validator.FieldLevel) bool {
	sign := fl.Field().String()

	addrVal, addrKind, _, isAddrFound := fl.GetStructFieldOK2()
	if addrKind != reflect.String && !isAddrFound {
		return false
	}
	addr := addrVal.String()

	err := ethereum.VerifySignature(addr, sign, signData)

	return err == nil
}

type PostWalletAddressRequest struct {
	UserID        string `json:"user_id" validate:"required"`
	WalletAddress string `json:"wallet_address" validate:"required,eth_addr"`
	Signature     string `json:"signature" validate:"required,eth_sign_addr=WalletAddress"`
}
