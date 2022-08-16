package services

import (
	"context"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/healthcheck"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/healthcheck/server"
	"github.com/team-azb/knowtfolio/server/gateways/ethereum"
	goahttp "goa.design/goa/v3/http"
	"gorm.io/gorm"
)

type healthcheckService struct {
	DB       *gorm.DB
	Contract *ethereum.ContractClient
}

func NewHealthcheckService(db *gorm.DB, contract *ethereum.ContractClient, handler HttpHandler) *server.Server {
	endpoints := healthcheck.NewEndpoints(healthcheckService{DB: db, Contract: contract})
	return server.New(
		endpoints,
		handler,
		goahttp.RequestDecoder,
		goahttp.ResponseEncoder,
		nil,
		nil)
}

func (s healthcheckService) GetHealthStatus(_ context.Context) (err error) {
	// Check DB
	db, err := s.DB.DB()
	if err != nil {
		return healthcheck.MakeDatabaseUnhealthy(err)
	}
	err = db.Ping()
	if err != nil {
		return healthcheck.MakeDatabaseUnhealthy(err)
	}

	// Check Blockchain
	_, err = s.Contract.Name(&bind.CallOpts{})
	if err != nil {
		return healthcheck.MakeContractUnhealthy(err)
	}

	return nil
}
