package aws

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
)

type SSMClient struct {
	*ssm.Client
}

func NewSSMClient() *SSMClient {
	return &SSMClient{Client: ssm.New(ssm.Options{
		Credentials: DefaultConfig.Credentials,
		Region:      Region,
	})}
}

func (c *SSMClient) GetParameterByPath(path string) (string, error) {
	res, err := c.GetParameter(context.Background(), &ssm.GetParameterInput{
		Name:           &path,
		WithDecryption: aws.Bool(true),
	})
	if err != nil {
		return "", err
	}
	return *res.Parameter.Value, nil
}
