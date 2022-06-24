package design

import "goa.design/goa/v3/dsl"

var _ = dsl.Service("article-html", func() {
	dsl.Description("SEO対策で、記事の表示だけ直接HTMLで返すためのサービス")

	dsl.HTTP(func() {
		dsl.Path("//article")
	})

	dsl.Method("Read HTML", func() {
		dsl.Description("Get article's HTML by id.")

		dsl.Payload(articleIdPayload)

		dsl.Result(dsl.Bytes, func() {
			dsl.Example("<h1> Hello World! </h1>")
		})
		dsl.Error("not_found")

		dsl.HTTP(func() {
			dsl.GET("/{id}")

			dsl.Response(dsl.StatusOK, func() {
				dsl.Description("IDに対応する記事のHTMLのバイナリ")
				dsl.ContentType("text/html; charset=UTF-8")
			})
			dsl.Response(dsl.StatusNotFound, "not_found", func() {
				dsl.Description("IDに対応する記事が見つからなかった場合。")
			})
		})
	})
})
