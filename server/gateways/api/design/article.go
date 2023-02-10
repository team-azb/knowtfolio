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

func titleAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, func() {
		dsl.Example("My Awesome Title")
	})
}

func contentAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, "本文のHTML", func() {
		dsl.Example("<h1> Hello World! </h1>")
	})
}

func articleOwnerAddressAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, func() {
		dsl.Description("所有者のウォレットのアドレス")
		dsl.Pattern("^0x[a-fA-F0-9]{40}$")
		dsl.Example(`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 `)
	})
}

func articleOwnerIdAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, func() {
		dsl.Description("所有者のUserID")

		dsl.Pattern("^[A-Za-z0-9_-]+$")
		dsl.MinLength(1)
		dsl.MaxLength(40)

		dsl.Example("exampleId01")
	})
}

var articleReadRequest = dsl.Type("ArticleReadRequest", func() {
	articleIdAttribute("id")
	dsl.Required("id")
})

var articleCreateRequest = dsl.Type("ArticleCreateRequest", func() {
	titleAttribute("title")
	contentAttribute("content")
	jwtAttribute("token")
	dsl.Required("title", "content", "token")
})

var articleUpdateRequest = dsl.Type("ArticleUpdateRequest", func() {
	// Path param
	articleIdAttribute("id")
	// Body
	titleAttribute("title")
	contentAttribute("content")
	jwtAttribute("token")

	dsl.Required("id", "token")
})

var articleDeleteRequest = dsl.Type("ArticleDeleteRequest", func() {
	articleIdAttribute("id")
	jwtAttribute("token")

	dsl.Required("id", "token")
})

var articleResult = dsl.ResultType("article-result", "ArticleResult", func() {
	dsl.Attributes(func() {
		articleIdAttribute("id")
		titleAttribute("title")
		contentAttribute("content")
		articleOwnerIdAttribute("owner_id")
		articleOwnerAddressAttribute("owner_address")
		dsl.Required("id", "title", "content", "owner_id")
	})

	dsl.View("default", func() {
		dsl.Attribute("id")
		dsl.Attribute("title")
		dsl.Attribute("content")
	})

	dsl.View("with-owner-info", func() {
		dsl.Attribute("id")
		dsl.Attribute("title")
		dsl.Attribute("content")
		dsl.Attribute("owner_id")
		dsl.Attribute("owner_address")
	})

	dsl.View("only-id", func() {
		dsl.Attribute("id")
	})
})

var _ = dsl.Service("articles", func() {
	dsl.Description("記事サービス")

	dsl.Error("not_found")

	dsl.HTTP(func() {
		dsl.Path("/articles")
	})

	dsl.Method("Create", func() {
		dsl.Description("Create new article.")

		dsl.Security(jwtSecurity)

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
			dsl.View("with-owner-info")
		})

		dsl.HTTP(func() {
			dsl.GET("/{id}")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Update", func() {
		dsl.Description("Update an article.")

		dsl.Security(jwtSecurity)

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

		dsl.Security(jwtSecurity)

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
