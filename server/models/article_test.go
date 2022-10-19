package models

import (
	"github.com/stretchr/testify/assert"
	"strings"
	"testing"
)

func TestToHtml(t *testing.T) {
	id := "abcdefghijk"
	title := "Hello Knowtfolio!"
	rawContent := `
		<div> Hello HTML! </div>
		<img src="https://i.imgur.com/Ru0JifT.jpeg" alt="basketball legend" width="410" height="213">
		<a href="javascript:alert('XSS1')" onmouseover="alert('XSS2')"> XSS <a>
	`
	doc := NewDocument(id, ArticleType, title, []byte(rawContent))
	src := Article{
		ID:       id,
		Document: *doc,
	}
	actual, err := src.ToHTML()
	assert.NoError(t, err)

	expected := `
			<head>
				<meta charset="UTF-8" />
				<title> Hello Knowtfolio! </title>
			</head>
			<body>
				<a href="/articles">記事一覧</a>
				<a href="/articles/abcdefghijk/edit">記事を編集</a>
				<h1> Hello Knowtfolio! </h1>
				<div> Hello HTML! </div>
				<img src="https://i.imgur.com/Ru0JifT.jpeg" alt="basketball legend" width="410" height="213">
				XSS
			</body>`

	assert.Equal(t, strings.Fields(expected), strings.Fields(string(actual)))
}
