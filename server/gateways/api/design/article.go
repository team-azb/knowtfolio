package design

import (
	"goa.design/goa/v3/dsl"
)

func articleIdAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, func() {
		dsl.Description("記事のID")

		dsl.Pattern("^[A-Za-z0-9_-]+$")
		dsl.MinLength(11)
		dsl.MaxLength(11)

		dsl.Example("exampleId01")
	})
}

func articleTitleAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, func() {
		dsl.Example("My Awesome Article")
	})
}

func articleContentAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, "本文のHTML", func() {
		dsl.Example("<h1> Hello World! </h1>")
	})
}

// TODO: Define this as Security.
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

var articleReadRequest = dsl.Type("ArticleReadRequest", func() {
	articleIdAttribute("id")
	dsl.Required("id")
})

var articleCreateRequest = dsl.Type("ArticleCreateRequest", func() {
	articleTitleAttribute("title")
	articleContentAttribute("content")
	smartWalletAuthAttributes("address", "signature")
	dsl.Required("title", "content", "address", "signature")
})

var articleUpdateRequest = dsl.Type("ArticleUpdateRequest", func() {
	// Path param
	articleIdAttribute("id")
	// Body
	articleTitleAttribute("title")
	articleContentAttribute("content")
	smartWalletAuthAttributes("address", "signature")

	dsl.Required("id", "address", "signature")
})

var articleDeleteRequest = dsl.Type("ArticleDeleteRequest", func() {
	articleIdAttribute("id")
	smartWalletAuthAttributes("address", "signature")
	dsl.Required("id", "address", "signature")
})

var article = dsl.Type("Article", func() {
	articleIdAttribute("id")
	articleTitleAttribute("title")
	articleContentAttribute("content")
	dsl.Required("id", "title", "content")
})

var articleResult = dsl.ResultType("application/json", "ArticleResult", func() {
	dsl.Extend(article)

	dsl.View("default", func() {
		dsl.Attribute("id")
		dsl.Attribute("title")
		dsl.Attribute("content")
	})
	dsl.View("only-id", func() {
		dsl.Attribute("id")
	})
})

var _ = dsl.Service("articles", func() {
	dsl.Description("記事サービス")

	dsl.Error("article_not_found")

	dsl.HTTP(func() {
		dsl.Path("/articles")
	})

	dsl.Method("Create", func() {
		dsl.Description("Create new article.")

		dsl.Payload(articleCreateRequest, "作成したい記事の情報")

		dsl.Result(articleResult, func() {
			dsl.View("default")
		})
		dsl.Error("unauthenticated")

		dsl.HTTP(func() {
			dsl.POST("/")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Read", func() {
		dsl.Description("Get article by id.")

		dsl.Payload(articleReadRequest)

		dsl.Result(articleResult, func() {
			dsl.View("default")
		})

		dsl.HTTP(func() {
			dsl.GET("/{id}")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Update", func() {
		dsl.Description("Update an article.")

		dsl.Payload(articleUpdateRequest, "記事の更新内容\nリクエストに含まれるフィールドだけ更新される。")

		dsl.Result(articleResult, func() {
			dsl.View("default")
		})
		dsl.Error("unauthenticated")
		dsl.Error("unauthorized")

		dsl.HTTP(func() {
			dsl.PUT("/{id}")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Delete", func() {
		dsl.Description("Delete article by id.")

		dsl.Payload(articleDeleteRequest)

		dsl.Result(articleResult, func() {
			dsl.View("only-id")
		})
		dsl.Error("unauthenticated")
		dsl.Error("unauthorized")

		dsl.HTTP(func() {
			dsl.DELETE("/{id}")

			dsl.Response(dsl.StatusOK)
		})
	})
})
