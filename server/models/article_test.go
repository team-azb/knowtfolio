package models

import (
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestToHtml(t *testing.T) {
	rawContent := `
		<div> Hello HTML! </div>
		<img src="https://i.imgur.com/Ru0JifT.jpeg" alt="basketball legend" width="410" height="213">
	`
	src := Article{
		ID:        "abcdefghijk",
		Title:     "Hello Knowtfolio!",
		Content:   []byte(rawContent),
		CreatedAt: time.Time{},
		UpdatedAt: time.Time{},
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
			</body>`

	assert.Equal(t, strings.Fields(expected), strings.Fields(string(actual)))
}
