package services

import (
	"context"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"strings"
	"sync"
	"testing"
)

func fatalfIfError(t *testing.T, err error, format string, args ...any) {
	if err != nil {
		t.Fatalf("%v: %v", fmt.Sprintf(format, args...), err)
	}
}

func initTestDB(t *testing.T) (db *gorm.DB) {
	if testing.Short() {
		t.Skip("Tests using DB are skipped.")
	}
	// Connect to DB.
	db, err := gorm.Open(mysql.Open("root:password@tcp(db:3306)/?parseTime=true"))
	fatalfIfError(t, err, "DB Connection failed")

	// Create temporary database dedicated to this test call.
	dbName := fmt.Sprintf("knowtfolio-db-test-%v", strings.ReplaceAll(t.Name(), "/", "_"))
	res := db.Exec(fmt.Sprintf("CREATE DATABASE `%v`", dbName))
	if res.Error != nil {
		t.Fatalf("DB Creation failed: %v", res.Error)
	}

	// Make sure to drop the temporary database after the test.
	t.Cleanup(func() {
		_ = db.Exec(fmt.Sprintf("DROP DATABASE `%v`", dbName))
	})

	t.Logf("[%v] Created temporary DB %v!", t.Name(), dbName)

	// Connect to the temporary database.
	db, err = gorm.Open(mysql.Open(fmt.Sprintf("root:password@tcp(db:3306)/%v?parseTime=true", dbName)))
	fatalfIfError(t, err, "Connection to Created DB %v failed", dbName)

	return
}

var adminAddr = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

var transactionLock = map[string]*sync.Mutex{user0Addr: {}, user1Addr: {}, adminAddr: {}}

func initTestContractClient(t *testing.T) *ethereum.ContractClient {
	if testing.Short() {
		t.Skip("Tests using Contract are skipped.")
	}

	client, err := ethclient.Dial(config.NetworkURI)
	fatalfIfError(t, err, "EthClient Connection failed")

	// Initialize transactor to deploy the contract.
	opts, err := bind.NewKeyedTransactorWithChainID(config.AdminPrivateKey, config.ChainID)
	opts.GasPrice, err = client.SuggestGasPrice(opts.Context)
	fatalfIfError(t, err, "Failed to init transactor")

	transactionLock[opts.From.String()].Lock()
	defer transactionLock[opts.From.String()].Unlock()

	// Deploy the contract and wait for it to complete.
	_, tx, _, err := ethereum.DeployContractBinding(opts, client)
	fatalfIfError(t, err, "Contract deployment failed")
	addr, err := bind.WaitDeployed(context.Background(), client, tx)
	fatalfIfError(t, err, "Contract deployment waiting failed")

	// Initialize the client and the contract.
	config.ContractAddress = addr
	cli, err := ethereum.NewContractClient(config.ContractAddress, client)
	// NOTE: For some reason, the contract's `initialize` function is not called correctly in Golang deployments,
	//       and, as a result, the owner of the contract becomes 0x0, which makes onlyOwner calls impossible.
	//       Therefore, we call `initialize` explicitly here in order to the owner to admin.
	_, _ = cli.Initialize(opts)
	fatalfIfError(t, err, "Contract initialization failed")

	t.Logf("[%v] Deployed contract %v to %v!", t.Name(), config.ContractAddress, config.NetworkURI)

	return cli
}
