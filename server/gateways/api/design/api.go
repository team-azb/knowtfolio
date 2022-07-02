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

	dsl.Error("article_not_found")
	dsl.Error("unauthenticated")
	dsl.Error("unauthorized")

	dsl.HTTP(func() {
		dsl.Path("/api")

		dsl.Response("article_not_found", dsl.StatusNotFound, func() {
			dsl.Description("記事IDに対応する記事が見つからなかった場合")
		})
		dsl.Response("unauthenticated", dsl.StatusUnauthorized, func() {
			dsl.Description("認証に失敗した場合")
		})
		dsl.Response("unauthorized", dsl.StatusForbidden, func() {
			dsl.Description("操作を行う権限がない場合")
		})
	})
})

// Set error response content type.
func init() {
	dsl.ErrorResultIdentifier += "+json"
	dsl.ErrorResult.Identifier = dsl.ErrorResultIdentifier
}
