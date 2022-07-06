package config

import "os"

var (
	AdminPrivateKey = os.Getenv("ADMIN_PRIVATE_KEY")
	ContractAddress = os.Getenv("CONTRACT_ADDRESS")
	NetworkURI      = os.Getenv("NETWORK_URI")
)
