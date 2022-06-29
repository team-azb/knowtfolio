package design

import (
	"goa.design/goa/v3/dsl"
)

var _ = dsl.API("knowtfolio", func() {
	dsl.Title("Knowtfolio Backend")
	dsl.Description("Blogging platform that leverages NFT to grow, buy and sell articles.")

	dsl.Server("backend", func() {
		dsl.Host("development", func() { dsl.URI("http://localhost:8080") })

		dsl.Services("articles", "articles-html")
	})

	dsl.HTTP(func() {
		dsl.Path("/api")
	})
})

// Set error response content type.
func init() {
	dsl.ErrorResultIdentifier += "+json"
	dsl.ErrorResult.Identifier = dsl.ErrorResultIdentifier
}
