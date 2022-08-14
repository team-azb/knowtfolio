package design

import "goa.design/goa/v3/dsl"

var _ = dsl.Service("healthcheck", func() {
	dsl.Description("疎通確認サービス")

	dsl.Error("database_unhealthy")
	dsl.Error("contract_unhealthy")

	dsl.HTTP(func() {
		dsl.Path("/health")
		dsl.Response("database_unhealthy", dsl.StatusInternalServerError, func() {
			dsl.Description("サーバは生きているが、DBと接続できない場合")
		})
		dsl.Response("contract_unhealthy", dsl.StatusServiceUnavailable, func() {
			dsl.Description("サーバは生きているが、ブロックチェーン上のスマートコントラクトと接続できない場合")
		})
	})

	dsl.Method("Get health status.", func() {
		dsl.Description("Check server health.")

		dsl.HTTP(func() {
			dsl.GET("/")

			dsl.Response(dsl.StatusOK, func() {
				dsl.Description("サービスが正常に機能している場合")
			})
		})
	})
})
