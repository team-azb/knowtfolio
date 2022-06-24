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

var articleIdPayload = dsl.Type("ArticleId", func() {
	articleIdAttribute("id")
	dsl.Required("id")
})

var articleCreateRequest = dsl.Type("articleCreateRequest", func() {
	articleTitleAttribute("title")
	articleContentAttribute("content")
	dsl.Required("title", "content")
})

var articleUpdateRequest = dsl.Type("ArticleUpdateRequest", func() {
	// Path param
	articleIdAttribute("id")
	// Body
	articleTitleAttribute("title")
	articleContentAttribute("content")

	dsl.Required("id")
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

var _ = dsl.Service("article", func() {
	dsl.Description("記事サービス")

	dsl.Error("not_found")

	dsl.HTTP(func() {
		dsl.Path("/article")
	})

	dsl.Method("Create", func() {
		dsl.Description("Create new article.")

		dsl.Payload(articleCreateRequest, "作成したい記事の情報")

		dsl.Result(articleResult)

		dsl.HTTP(func() {
			dsl.POST("/")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Read", func() {
		dsl.Description("Get article by id.")

		dsl.Payload(articleIdPayload)

		dsl.Result(articleResult)

		dsl.HTTP(func() {
			dsl.GET("/{id}")

			dsl.Response(dsl.StatusOK)
			dsl.Response(dsl.StatusNotFound, "not_found", func() {
				dsl.Description("IDに対応する記事が見つからなかった場合。")
			})
		})
	})

	dsl.Method("Update", func() {
		dsl.Description("Update an article.")

		dsl.Payload(articleUpdateRequest, "記事の更新内容\nリクエストに含まれるフィールドだけ更新される。")

		dsl.Result(articleResult)

		dsl.HTTP(func() {
			dsl.PUT("/{id}")

			dsl.Response(dsl.StatusOK)
			dsl.Response(dsl.StatusNotFound, "not_found", func() {
				dsl.Description("IDに対応する記事が見つからなかった場合。")
			})
		})
	})

	dsl.Method("Delete", func() {
		dsl.Description("Delete article by id.")

		dsl.Payload(articleIdPayload)

		dsl.Result(articleResult, func() {
			dsl.View("only-id")
		})

		dsl.HTTP(func() {
			dsl.DELETE("/{id}")

			dsl.Response(dsl.StatusOK)
			dsl.Response(dsl.StatusNotFound, "not_found", func() {
				dsl.Description("IDに対応する記事が見つからなかった場合。")
			})
		})
	})
})
