package design

import "goa.design/goa/v3/dsl"

func smartWalletAuthAttributes(addressFieldName string, signatureFieldName string) {
	dsl.Attribute(addressFieldName, dsl.String, func() {
		dsl.Description("ウォレットのアドレス")
		dsl.Pattern("^0x[a-fA-F0-9]{40}$")
		dsl.Example(`'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'`)
	})
	dsl.Attribute(signatureFieldName, dsl.String, func() {
		dsl.Description("`address`のアカウントが行った署名")
	})
}

var articleTokenizeRequest = dsl.Type("ArticleTokenizeRequest", func() {
	articleIdAttribute("article_id")
	smartWalletAuthAttributes("address", "signature")
	dsl.Required("article_id", "address", "signature")
})

var articleTokenizeResult = dsl.ResultType("article-tokenize-result", "ArticleTokenizeResult", func() {
	dsl.Attribute("hash", dsl.String, func() {
		dsl.Description("トランザクションのハッシュ")
	})
	dsl.Attribute("cost", dsl.Int64, func() {
		dsl.Description("トークン発行にかかったコスト")
	})
	dsl.Required("hash", "cost")
})

var _ = dsl.Service("nfts", func() {
	dsl.Description("NFTを管理するサービス")

	dsl.HTTP(func() {
		dsl.Path("/nfts")
	})

	dsl.Method("Create for Article", func() {
		dsl.Description("MINT an NFT of the article.")

		dsl.Payload(articleTokenizeRequest)

		dsl.Result(articleTokenizeResult)
		dsl.Error("article_not_found")
		dsl.Error("unauthenticated")
		dsl.Error("unauthorized")

		dsl.HTTP(func() {
			dsl.POST("/{article_id}")

			dsl.Response(dsl.StatusOK)
		})
	})
})
