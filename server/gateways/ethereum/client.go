package ethereum

import (
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/team-azb/knowtfolio/server/config"
)

type ContractClient struct {
	*ContractBinding
	*ethclient.Client
}

func NewContractClient(address common.Address, client *ethclient.Client) (*ContractClient, error) {
	binding, err := NewContractBinding(address, client)
	if err != nil {
		return nil, err
	}
	return &ContractClient{binding, client}, nil
}

// NewAdminTransactOpts creates a bind.TransactOpts using config.AdminPrivateKey and `Client.SuggestGasPrice` method.
func (c *ContractClient) NewAdminTransactOpts() (*bind.TransactOpts, error) {
	opts, err := bind.NewKeyedTransactorWithChainID(config.AdminPrivateKey, config.ChainID)
	if err != nil {
		return nil, err
	}
	opts.GasPrice, err = c.Client.SuggestGasPrice(opts.Context)
	return opts, err
}
