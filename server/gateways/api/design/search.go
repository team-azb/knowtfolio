package design

import "goa.design/goa/v3/dsl"

var searchRequest = dsl.Type("SearchRequest", func() {
	dsl.Attribute("keywords", dsl.String, func() {
		dsl.Description("検索に使用するキーワード。`+`で区切ることで、複数指定可能")
		dsl.Example("Golang+NFT")
	})
	dsl.Attribute("owned_by", dsl.String, func() {
		dsl.Description("記事の所有者のUserID。指定がない場合、全ての所有者の記事を検索する。")
		dsl.Pattern("^[A-Za-z0-9_-]+$")
		dsl.MinLength(1)
		dsl.MaxLength(40)
		dsl.Example("exampleId01")
	})
	dsl.Attribute("sort_by", dsl.String, func() {
		dsl.Description("記事をソートするkey")
		dsl.Enum("created_at", "updated_at")
		dsl.Default("created_at")
	})
	dsl.Attribute("page_num", dsl.UInt, func() {
		dsl.Description("取得したい位置のページ番号（1-indexed）")
		dsl.Minimum(1)
		dsl.Default(1)
	})
	dsl.Attribute("page_size", dsl.UInt, func() {
		dsl.Description("1ページあたりのコンテンツ数")
		dsl.Minimum(1)
		dsl.Maximum(100)
		dsl.Default(10)
	})
})

var searchResultEntry = dsl.Type("SearchResultEntry", func() {
	articleIdAttribute("id")
	titleAttribute("title")
	articleOwnerIdAttribute("owner_id")
	articleOwnerAddressAttribute("owner_address")
	dsl.Required("id", "title", "owner_id")
})

var searchResult = dsl.ResultType("SearchResult", func() {
	dsl.Attribute("results", dsl.ArrayOf(searchResultEntry), "指定したページ内の検索結果")
	dsl.Attribute("total_count", dsl.UInt, "指定したページを含めたすべての検索結果の件数")
	dsl.Required("results", "total_count")
})

var _ = dsl.Service("search", func() {
	dsl.Description("検索サービス")

	dsl.HTTP(func() {
		dsl.Path("/search")
	})

	dsl.Method("Search for Articles", func() {
		dsl.Description("Get articles that matches to the request query.")

		dsl.Payload(searchRequest)

		dsl.Result(searchResult)

		dsl.HTTP(func() {
			dsl.GET("/")
			dsl.Params(func() {
				dsl.Param("keywords")
				dsl.Param("owned_by")
				dsl.Param("sort_by")
				dsl.Param("page_num")
				dsl.Param("page_size")
			})

			dsl.Response(dsl.StatusOK)
		})
	})
})
