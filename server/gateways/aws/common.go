package aws

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/config"
	"os"
)

var (
	Region           = os.Getenv("AWS_REGION")
	DefaultConfig, _ = config.LoadDefaultConfig(context.Background())
)
