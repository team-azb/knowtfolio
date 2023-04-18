package database

import (
	"fmt"
	"github.com/go-sql-driver/mysql"
	"github.com/team-azb/knowtfolio/server/config"
	"github.com/team-azb/knowtfolio/server/gateways/aws"
	"go.uber.org/multierr"
	gormmysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var defaultDBName, defaultDBUser, defaultDBPassword, defaultDBAddress string

func init() {
	switch config.EnvName {
	case "local":
		defaultDBName = "knowtfolio-db"
		defaultDBUser = "root"
		defaultDBPassword = "password"
		defaultDBAddress = "db:3306"
	case "dev": // TODO: Add "prod" here when prod env is ready.
		var err0, err1, err2, err3 error
		ssmClient := aws.NewSSMClient()

		defaultDBName, err0 = ssmClient.GetParameterByPath(fmt.Sprintf("/%s/db/name", config.EnvName))
		defaultDBUser, err1 = ssmClient.GetParameterByPath(fmt.Sprintf("/%s/db/user", config.EnvName))
		defaultDBPassword, err2 = ssmClient.GetParameterByPath(fmt.Sprintf("/%s/db/password", config.EnvName))
		defaultDBAddress, err3 = ssmClient.GetParameterByPath(fmt.Sprintf("/%s/db/address", config.EnvName))
		if err := multierr.Combine(err0, err1, err2, err3); err != nil {
			panic(err)
		}
	default:
		panic(fmt.Sprintf("unknown env name %v", config.EnvName))
	}
}

type ConnectionOption func(*mysql.Config)

func NewConnection(opts ...ConnectionOption) (*gorm.DB, error) {
	cfg := mysql.NewConfig()
	cfg.DBName = defaultDBName
	cfg.User = defaultDBUser
	cfg.Passwd = defaultDBPassword
	cfg.Addr = defaultDBAddress
	cfg.Net = "tcp"
	cfg.ParseTime = true

	for _, opt := range opts {
		opt(cfg)
	}

	db, err := gorm.Open(gormmysql.Open(cfg.FormatDSN()), &gorm.Config{FullSaveAssociations: true})

	// Output SQL on local execution.
	if err != nil && config.EnvName == "local" {
		db = db.Debug()
	}

	return db, err
}

func WithDBName(name string) ConnectionOption {
	return func(cfg *mysql.Config) {
		cfg.DBName = name
	}
}
