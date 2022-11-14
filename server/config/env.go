package config

import (
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"math/big"
	"os"
)

var (
	AdminPrivateKey, _ = crypto.HexToECDSA(os.Getenv("ADMIN_PRIVATE_KEY"))
	ContractAddress    = common.HexToAddress(os.Getenv("CONTRACT_ADDRESS"))
	DatabaseURI        = fmt.Sprintf("%v?parseTime=true", os.Getenv("DB_URI"))
	NetworkURI         = os.Getenv("NETWORK_URI")
	ChainID, _         = big.NewInt(0).SetString(os.Getenv("CHAIN_ID"), 0)
	S3BucketName       = os.Getenv("S3_BUCKET_NAME")
)
