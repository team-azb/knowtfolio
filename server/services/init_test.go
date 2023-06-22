package services

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"os"
	"strings"
	"sync"
	"testing"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"github.com/team-azb/knowtfolio/server/gateways/database"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	"github.com/team-azb/knowtfolio/server/models"
	"go.uber.org/multierr"
	"gorm.io/gorm"
)

var (
	adminAddr = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
	// NOTE: These two private keys are from hardhat default accounts, and are publicly available here:
	// https://hardhat.org/hardhat-network/docs/overview
	user0PrivateKeyHex = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
	user1PrivateKeyHex = "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
	testUsers          = []testUser{
		{
			ID:            "test-user0",
			Password:      "Password#0",
			Email:         "user0@example.com",
			PrivateKeyHex: &user0PrivateKeyHex,
		}, {
			ID:            "test-user1",
			Password:      "Password#1",
			Email:         "user1@sample.com",
			PrivateKeyHex: &user1PrivateKeyHex,
		}, {
			ID:            "test-user2",
			Password:      "Password#2",
			Email:         "user2@sample.com",
			PrivateKeyHex: nil,
		},
	}
	transactionLock = map[string]*sync.Mutex{*testUsers[0].Address(): {}, *testUsers[1].Address(): {}, adminAddr: {}}
	cognitoClient   = aws.NewCognitoClient()
	dynamodbClient  = aws.NewDynamoDBClient()
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
	setupDB, err := database.NewConnection()
	fatalfIfError(t, err, "DB Connection failed")

	// Create temporary database dedicated to this test call.
	dbName := fmt.Sprintf("knowtfolio-%v", strings.ReplaceAll(t.Name(), "/", "_"))
	res := setupDB.Exec(fmt.Sprintf("CREATE DATABASE `%v`", dbName))
	if res.Error != nil {
		t.Fatalf("DB Creation failed: %v", res.Error)
	}

	// Make sure to drop the temporary database after the test.
	t.Cleanup(func() {
		_ = setupDB.Exec(fmt.Sprintf("DROP DATABASE `%v`", dbName))
	})

	t.Logf("[%v] Created temporary DB %v!", t.Name(), dbName)

	// Connect to the temporary database.
	db, err = database.NewConnection(database.WithDBName(dbName))
	fatalfIfError(t, err, "Connection to Created DB %v failed", dbName)

	err = db.AutoMigrate(models.Article{}, models.Document{})
	if err != nil {
		t.Fatal(err)
	}

	return
}

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

type testUser struct {
	ID            string
	Password      string
	Email         string
	PrivateKeyHex *string
	IDToken       string
}

func (u *testUser) privateKey() *ecdsa.PrivateKey {
	if u.PrivateKeyHex == nil {
		return nil
	}
	privateKey, err := crypto.HexToECDSA(*u.PrivateKeyHex)
	if err != nil {
		panic(err)
	}
	return privateKey
}

func (u *testUser) Address() *string {
	if u.PrivateKeyHex == nil {
		return nil
	}

	publicKey, ok := u.privateKey().Public().(*ecdsa.PublicKey)
	if !ok {
		panic("error casting public key to ECDSA")
	}

	address := crypto.PubkeyToAddress(*publicKey).Hex()
	return &address
}

func (u *testUser) GetUserIDContext() context.Context {
	return context.WithValue(context.Background(), UserIDCtxKey, u.ID)
}

func (u *testUser) GenerateSignature(message string) string {
	nonce, err := dynamodbClient.GetNonceByID(u.ID)
	if err != nil {
		panic(err)
	}

	data := ethereum.GenerateSignData(message, *nonce)
	hash := accounts.TextHash([]byte(data))

	signature, err := crypto.Sign(hash, u.privateKey())
	if err != nil {
		panic(err)
	}
	return hexutil.Encode(signature)
}

func (u *testUser) registerToAWS() error {
	err := cognitoClient.CreateUserWithPassword(u.ID, u.Password, u.Email)
	if err != nil {
		return err
	}

	if u.Address() != nil {
		err = dynamodbClient.PutUserWallet(u.ID, *u.Address())
		if err != nil {
			return err
		}
	}

	u.IDToken, err = cognitoClient.GetIDTokenOfUser(u.ID, u.Password)
	return err
}

func (u *testUser) deleteFromAWS() error {
	err := cognitoClient.DeleteUserByID(u.ID)
	if err != nil {
		return err
	}

	if u.Address() != nil {
		err = dynamodbClient.DeleteUserWalletByID(u.ID)
	}
	return err
}

func runTests(m *testing.M) (code int) {
	var errs []error
	for i := range testUsers {
		err := testUsers[i].registerToAWS()
		errs = append(errs, err)
	}

	defer func() {
		for i := range testUsers {
			err := testUsers[i].deleteFromAWS()
			errs = append(errs, err)
		}
		if combined := multierr.Combine(errs...); combined != nil {
			panic(fmt.Sprintf("test user creation/deletion failed: %+v", combined))
		}
	}()

	if multierr.Combine(errs...) != nil {
		return 1
	}

	code = m.Run()
	return code
}

func TestMain(m *testing.M) {
	code := runTests(m)
	os.Exit(code)
}
