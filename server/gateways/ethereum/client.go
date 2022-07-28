package ethereum

import (
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
// If the article NFT doesn't exist, it returns `target.OriginalAuthorAddress`.
func (c *ContractClient) GetOwnerAddressOf(target models.Article) (*common.Address, error) {
	// TODO: Rename GetOwnerOfArticle to GetOwnerOfArticleToken
	owner, err := c.GetOwnerOfArticle(&bind.CallOpts{}, target.ID)
	if err != nil {
		return nil, err
	}
	// TODO: Add Article.IsTokenized to check this before contract call.
	if owner.String() == common.BigToAddress(big.NewInt(0)).String() {
		owner = common.HexToAddress(target.OriginalAuthorAddress)
	}
	return &owner, nil
}
