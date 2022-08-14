package services

import (
	"context"
	"github.com/stretchr/testify/assert"
	"github.com/team-azb/knowtfolio/server/gateways/api/gen/http/healthcheck/server"
	"github.com/team-azb/knowtfolio/server/models"
	"testing"
)

func prepareHealthcheckService(t *testing.T) healthcheckService {
	t.Parallel()

	service := healthcheckService{
		DB:       initTestDB(t),
		Contract: initTestContractClient(t),
	}
	err := service.DB.AutoMigrate(models.Article{})
	if err != nil {
		t.Fatal(err)
	}

	return service
}

func TestGetHealthStatus(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		service := prepareHealthcheckService(t)

		err := service.GetHealthStatus(context.Background())

		assert.Nil(t, err)
	})

	t.Run("FailWithoutDB", func(t *testing.T) {
		service := prepareHealthcheckService(t)

		db, err := service.DB.DB()
		err = db.Close()
		assert.NoError(t, err)

		err = service.GetHealthStatus(context.Background())

		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "database_unhealthy", namer.ErrorName())
	})

	t.Run("FailWithoutContractClient", func(t *testing.T) {
		service := prepareHealthcheckService(t)

		service.Contract.Close()
		err := service.GetHealthStatus(context.Background())

		var namer server.ErrorNamer
		assert.ErrorAs(t, err, &namer)
		assert.Equal(t, "contract_unhealthy", namer.ErrorName())
	})
}
