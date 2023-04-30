package models

import (
	"github.com/ethereum/go-ethereum/common"
)

type PostWalletAddressRequest struct {
	UserID        string `json:"user_id" validate:"required"`
	WalletAddress string `json:"wallet_address" validate:"required,eth_addr"`
	Signature     string `json:"signature" validate:"required"`
}

func (p *PostWalletAddressRequest) ValidationInfo() (EthSignatureValidationInfo, error) {
	nonce, err := dynamoDB.GetNonceByID(p.UserID)
	if err != nil {
		return EthSignatureValidationInfo{}, err
	}

	return EthSignatureValidationInfo{
		Address:            common.HexToAddress(p.WalletAddress),
		Message:            "Register wallet address",
		Nonce:              nonce,
		Signature:          p.Signature,
		SignatureFieldName: "Signature",
	}, nil
}
