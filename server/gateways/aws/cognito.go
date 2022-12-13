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
	cognitoJWK, _ = jwk.ParseString("{\"keys\":[{\"alg\":\"RS256\",\"e\":\"AQAB\",\"kid\":\"AMdE0JKt8PjwK57eCcSfMhedr1bSGKSGW2irohYgcJY=\",\"kty\":\"RSA\",\"n\":\"xkSOdHjFVixqdSUWmeKfEN6cEF2L2DK5A08R8vgySWNgOTmwZpccul9xrCu1UsiawhThvMH5O0gQ-Tho4mMa6BcTV2_9EzJnxHQC84a2rALxWxZ41PvQXv-QZcZZ-Fn-pl9AuEDWzKVYyr_qGd7hxA_lBYpBX7n_nEQ7yIz-_0vIgzBtTHeLXuCzt9tl2F-I6f7v06n9yD3eV2a9esWC2cfhf5TgkxN7Zj3ZXVCVM68mPe3UrIMv-tkuF8kBwCrg9ScUK0sDbNmEOURDHLLsUNh_b-NTaqwT1_2ZTUngAi2dSfZG_E2jjSuFP2MFu41qYrK3XXEuWRCt85bxZJIkBw\",\"use\":\"sig\"},{\"alg\":\"RS256\",\"e\":\"AQAB\",\"kid\":\"9lPI9t+5pkxvdVixlwsMJPE+77t2yMB2LOrz2W4tQwQ=\",\"kty\":\"RSA\",\"n\":\"wQ8RtN-ImJBP3wy3w1o7GxRdfG_lF_pagXaBe-pvfu9zI8-sV5Yfr556APDlYJXIB_LuuxFS9bxBn4HE9nE9FqGR8BZTgXES_cgcIXlvlQEHeTAXzD2N0-4gAkRigCG-WDhEf5Dnafu4BI1kDr0YPpyUAGtnRRl5hvIkxXSYcNzk9VfZ8Ls8UXrSgkc8Z_TvRuL6J1UbdqitqVrdPjVNZoUpesuF6p0g42o9BN8pvFMsDXzqinah9dklUE7orsErnwe_jpozxugDq1iBcsA-Sc7mUERHNwqdhO3L6-HxqgatQGYbtXmAMlmq5bRN-uJQgyMEX6Vzb4Q_jJgTJ7xEJQ\",\"use\":\"sig\"}]}")
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
