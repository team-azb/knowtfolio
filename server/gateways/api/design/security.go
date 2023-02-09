package design

import "goa.design/goa/v3/dsl"

var jwtSecurity = dsl.JWTSecurity("cognito_id_token", func() {
	dsl.Description("Cognitoで生成されたIDトークンのJWT")
})

func jwtAttribute(name string) {
	dsl.Token(name, dsl.String, "Cognitoで生成されたIDトークンのJWT")
}
