package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"path"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/aws_utils"
	"github.com/team-azb/knowtfolio/infrastructure/function_scripts/pkg/models"
)

func searchAttribute(attrs []types.AttributeType, key string) string {
	for _, attr := range attrs {
		if *attr.Name == key {
			return *attr.Value
		}
	}
	return ""
}

func handler(ctx context.Context, request events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {
	fmt.Printf("Get User: %#v\n", request)

	username := path.Base(request.RawPath)
	user, err := aws_utils.CognitoIdentityProviderClient.AdminGetUser(ctx, &cognitoidentityprovider.AdminGetUserInput{
		UserPoolId: &aws_utils.CognitoUserPoolId,
		Username:   &username,
	})
	if err != nil {
		return events.LambdaFunctionURLResponse{
			StatusCode: http.StatusNotFound,
			Body:       err.Error(),
		}, nil
	}

	biography := searchAttribute(user.UserAttributes, "custom:description")
	website := searchAttribute(user.UserAttributes, "website")
	picture := searchAttribute(user.UserAttributes, "picture")

	userInfo := &models.PublicUserInfo{
		UserName:  *user.Username,
		Biography: biography,
		Website:   website,
		Picture:   picture,
	}

	jsonBody, _ := json.Marshal(userInfo)

	return events.LambdaFunctionURLResponse{
		StatusCode: http.StatusOK,
		Body:       string(jsonBody),
	}, nil
}

func main() {
	lambda.Start(handler)
}
