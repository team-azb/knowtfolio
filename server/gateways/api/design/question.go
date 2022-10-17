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

func answerIdAttribute(fieldName string) {
	dsl.Attribute(fieldName, dsl.String, func() {
		dsl.Description("回答のID")

		dsl.Pattern("^[A-Za-z0-9_-]+$")
		dsl.MinLength(11)
		dsl.MaxLength(11)

		dsl.Example("exampleId01")
	})
}

var (
	questionReadRequest = dsl.Type("QuestionReadRequest", func() {
		questionIdAttribute("id")
		dsl.Required("id")
	})
	questionCreateRequest = dsl.Type("QuestionCreateRequest", func() {
		titleAttribute("title")
		contentAttribute("content")
		dsl.Required("title", "content")
	})
	questionUpdateRequest = dsl.Type("QuestionUpdateRequest", func() {
		// Path param
		questionIdAttribute("id")
		// Body
		titleAttribute("title")
		contentAttribute("content")

		dsl.Required("id")
	})
	questionDeleteRequest = dsl.Type("QuestionDeleteRequest", func() {
		questionIdAttribute("id")
		dsl.Required("id")
	})

	answerCreateRequest = dsl.Type("AnswerCreateRequest", func() {
		questionIdAttribute("id")
		contentAttribute("content")
		dsl.Required("id", "content")
	})
	answerReadRequest = dsl.Type("AnswerReadRequest", func() {
		questionIdAttribute("id")
		answerIdAttribute("answer_id")
		dsl.Required("id", "answer_id")
	})
	answerUpdateRequest = dsl.Type("AnswerUpdateRequest", func() {
		questionIdAttribute("id")
		answerIdAttribute("answer_id")
		contentAttribute("content")
		dsl.Required("id", "answer_id", "content")
	})
	answerDeleteRequest = dsl.Type("AnswerDeleteRequest", func() {
		questionIdAttribute("id")
		answerIdAttribute("answer_id")
		dsl.Required("id", "answer_id")
	})
)

var (
	questionResult = dsl.ResultType("question-result", "QuestionResult", func() {
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
	answerResult = dsl.ResultType("answer-result", "AnswerResult", func() {
		dsl.Attributes(func() {
			answerIdAttribute("answer_id")
			questionIdAttribute("question_id")
			contentAttribute("content")
			dsl.Required("answer_id", "question_id", "content")
		})

		dsl.View("default", func() {
			dsl.Attribute("answer_id")
			dsl.Attribute("question_id")
			dsl.Attribute("content")
		})

		dsl.View("only-id", func() {
			dsl.Attribute("answer_id")
		})
	})
)

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

	dsl.Method("Create Answer", func() {
		dsl.Description("Create an answer for a question.")

		dsl.Payload(answerCreateRequest)

		dsl.Result(answerResult, func() {
			dsl.View("default")
		})

		dsl.HTTP(func() {
			dsl.POST("/{id}/answers")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Read Answer", func() {
		dsl.Description("Read an answer for a question.")

		dsl.Payload(answerReadRequest)

		dsl.Result(answerResult, func() {
			dsl.View("default")
		})

		dsl.HTTP(func() {
			dsl.GET("/{id}/answers/{answer_id}")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Update Answer", func() {
		dsl.Description("Update an answer for a question.")

		dsl.Payload(answerUpdateRequest)

		dsl.Result(answerResult, func() {
			dsl.View("default")
		})

		dsl.HTTP(func() {
			dsl.PUT("/{id}/answers/{answer_id}")

			dsl.Response(dsl.StatusOK)
		})
	})

	dsl.Method("Delete Answer", func() {
		dsl.Description("Delete an answer for a question.")

		dsl.Payload(answerDeleteRequest)

		dsl.Result(answerResult, func() {
			dsl.View("only-id")
		})

		dsl.HTTP(func() {
			dsl.DELETE("/{id}/answers/{answer_id}")

			dsl.Response(dsl.StatusOK)
		})
	})
})
