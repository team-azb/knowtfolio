package design

import "goa.design/goa/v3/dsl"

func questionIdAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, func() {
		dsl.Description("質問のID")

		dsl.Pattern("^[A-Za-z0-9_-]+$")
		dsl.MinLength(11)
		dsl.MaxLength(11)

		dsl.Example("exampleId01")
	})
}

var questionReadRequest = dsl.Type("QuestionReadRequest", func() {
	questionIdAttribute("id")
	dsl.Required("id")
})

var questionCreateRequest = dsl.Type("QuestionCreateRequest", func() {
	titleAttribute("title")
	contentAttribute("content")
	dsl.Required("title", "content")
})

var questionUpdateRequest = dsl.Type("QuestionUpdateRequest", func() {
	// Path param
	questionIdAttribute("id")
	// Body
	titleAttribute("title")
	contentAttribute("content")

	dsl.Required("id")
})

var questionDeleteRequest = dsl.Type("QuestionDeleteRequest", func() {
	questionIdAttribute("id")
	dsl.Required("id")
})

var questionResult = dsl.ResultType("question-result", "QuestionResult", func() {
	dsl.Attributes(func() {
		questionIdAttribute("id")
		titleAttribute("title")
		contentAttribute("content")
		dsl.Required("id", "title", "content")
	})

	dsl.View("default", func() {
		dsl.Attribute("id")
		dsl.Attribute("title")
		dsl.Attribute("content")
	})

	dsl.View("only-id", func() {
		dsl.Attribute("id")
	})
})

var _ = dsl.Service("questions", func() {
	dsl.Description("質問サービス")

	dsl.Error("not_found")

	dsl.HTTP(func() {
		dsl.Path("/questions")
	})

	dsl.Method("Create", func() {
		dsl.Description("Create new question.")

		dsl.Payload(questionCreateRequest, "作成したい質問の情報")

		dsl.Result(questionResult, func() {
			dsl.View("default")
		})

		dsl.HTTP(func() {
			dsl.POST("/")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Read", func() {
		dsl.Description("Get question by id.")

		dsl.Payload(questionReadRequest)

		dsl.Result(questionResult, func() {
			dsl.View("default")
		})

		dsl.HTTP(func() {
			dsl.GET("/{id}")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Update", func() {
		dsl.Description("Update question by id.")

		dsl.Payload(questionUpdateRequest, "質問の更新内容\nリクエストに含まれるフィールドだけ更新される。")

		dsl.Result(questionResult, func() {
			dsl.View("default")
		})

		dsl.HTTP(func() {
			dsl.PUT("/{id}")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Delete", func() {
		dsl.Description("Delete question by id.")

		dsl.Payload(questionDeleteRequest)

		dsl.Result(questionResult, func() {
			dsl.View("only-id")
		})

		dsl.HTTP(func() {
			dsl.DELETE("/{id}")

			dsl.Response(dsl.StatusOK)
		})
	})
})
