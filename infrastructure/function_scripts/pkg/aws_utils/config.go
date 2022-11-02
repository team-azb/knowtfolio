package aws_utils

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"os"
)

// common
var (
	DefaultConfig, _ = config.LoadDefaultConfig(context.Background())
	Region           = os.Getenv("AWS_REGION")
)

// cognito
var (
	CognitoUserPoolId = os.Getenv("USER_POOL_ID")
	CognitoClientId   = os.Getenv("CLIENT_ID")
	CognitoClient     = cognitoidentityprovider.New(cognitoidentityprovider.Options{
		Credentials: DefaultConfig.Credentials,
		Region:      Region,
	})
)

// lambda
var (
	LambdaClient = lambda.New(lambda.Options{
		Credentials: DefaultConfig.Credentials,
		Region:      Region,
	})
)
