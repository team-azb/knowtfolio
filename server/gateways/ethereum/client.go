package ethereum

import (
	"errors"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/models"
	"math/big"
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

// GetOwnerAddressOf loads look for article NFT, and if it exists, it returns its owner.
// If the article NFT doesn't exist, it returns nil.
func (c *ContractClient) GetOwnerAddressOf(target models.Article) (*common.Address, error) {
	if target.IsTokenized {
		owner, err := c.GetOwnerOfArticle(&bind.CallOpts{}, target.ID)
		if err != nil {
			return nil, err
		}

		if owner.String() == common.BigToAddress(big.NewInt(0)).String() {
			return nil, errors.New(fmt.Sprintf(
				"couldn't find nft for article %s although `isTokenized` is set to true",
				target.ID,
			))
		} else {
			return &owner, nil
		}
	} else {
		return nil, nil
	}
}
