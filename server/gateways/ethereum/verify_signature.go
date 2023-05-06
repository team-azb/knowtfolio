package ethereum

import (
	"crypto/rand"
	"errors"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

func GenerateNonce() (common.Hash, error) {
	nonceBytes := make([]byte, 32)
	_, err := rand.Read(nonceBytes)
	if err != nil {
		return common.Hash{}, err
	}
	return common.BytesToHash(nonceBytes), nil
}

func GenerateSignData(message string, nonce common.Hash) string {
	return fmt.Sprintf("%s\n(nonce: %s)", message, nonce.Hex())
}

// VerifySignature checks if `sign` is a signature that is signed by `addr` using `signedData`.
func VerifySignature(addr string, sign string, message string, nonce *common.Hash) error {
	decodedSign, err := hexutil.Decode(sign)
	if err != nil {
		return err
	}

	// NOTE: Some client generates 27/28 instead of 0/1 due to Legacy Ethereum
	// ref) https://github.com/ethereum/go-ethereum/issues/19751#issuecomment-504900739
	if decodedSign[crypto.RecoveryIDOffset] >= 27 {
		decodedSign[crypto.RecoveryIDOffset] -= 27
	}

	var signedData string
	if nonce != nil {
		signedData = GenerateSignData(message, *nonce)
	} else {
		signedData = message
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
