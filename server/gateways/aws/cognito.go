package aws

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"os"
)

var (
	userPoolID    = os.Getenv("COGNITO_USER_POOL_ID")
	clientId      = os.Getenv("COGNITO_CLIENT_ID")
	issuer        = fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s", Region, userPoolID)
	cognitoJWK, _ = jwk.Fetch(context.Background(), fmt.Sprintf("%s/.well-known/jwks.json", issuer))
)

type CognitoClient struct {
	*cognitoidentityprovider.Client
}

func NewCognitoClient() *CognitoClient {
	return &CognitoClient{Client: cognitoidentityprovider.New(cognitoidentityprovider.Options{
		Credentials: DefaultConfig.Credentials,
		Region:      Region,
	})}
}

func (c *CognitoClient) VerifyCognitoToken(idTokenStr string) (userId string, err error) {
	validatedToken, err := jwt.ParseString(
		idTokenStr,
		jwt.WithKeySet(cognitoJWK),
		// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html#amazon-cognito-user-pools-using-tokens-step-3
		jwt.WithValidate(true),
		jwt.WithIssuer(issuer),
		jwt.WithAudience(clientId),
		jwt.WithClaimValue("token_use", "id"),
	)
	if err != nil {
		return
	}

	userIdRaw, ok := validatedToken.Get("cognito:username")
	if !ok {
		err = errors.New("could not find `cognito:username` in the verified JWT")
	}
	userId = userIdRaw.(string)
	return
}

func (c *CognitoClient) CreateUserWithPassword(userID string, password string, phoneNumber string) error {
	_, err := c.AdminCreateUser(context.Background(), &cognitoidentityprovider.AdminCreateUserInput{
		Username: &userID,
		UserAttributes: []types.AttributeType{
			{
				Name:  aws.String("phone_number"),
				Value: &phoneNumber,
			},
		},
		UserPoolId: &userPoolID,
	})
	if err != nil {
		return err
	}

	_, err = c.AdminSetUserPassword(context.Background(), &cognitoidentityprovider.AdminSetUserPasswordInput{
		Username:   &userID,
		Password:   &password,
		UserPoolId: &userPoolID,
		Permanent:  true,
	})
	return err
}

func (c *CognitoClient) GetIDTokenOfUser(userID string, password string) (string, error) {
	auth, err := c.AdminInitiateAuth(context.Background(), &cognitoidentityprovider.AdminInitiateAuthInput{
		AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
		AuthParameters: map[string]string{
			"USERNAME": userID,
			"PASSWORD": password,
		},
		UserPoolId: &userPoolID,
		ClientId:   &clientId,
	})
	if err != nil {
		return "", err
	}
	return *auth.AuthenticationResult.IdToken, nil
}

func (c *CognitoClient) DeleteUserByID(userID string) error {
	_, err := c.AdminDeleteUser(context.Background(), &cognitoidentityprovider.AdminDeleteUserInput{
		Username:   &userID,
		UserPoolId: &userPoolID,
	})
	return err
}
