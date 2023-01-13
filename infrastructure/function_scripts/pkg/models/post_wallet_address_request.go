package models

type PostWalletAddressRequest struct {
	UserID        string `json:"user_id" validate:"required"`
	WalletAddress string `json:"wallet_address" validate:"required,eth_addr"`
	Signature     string `json:"signature" validate:"required,eth_sign_addr=WalletAddress"`
}
