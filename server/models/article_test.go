package models

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/assert"
	"math/big"
	"strings"
	"testing"
	"time"
)

func TestSetTitleIfPresent(t *testing.T) {
	orgTitle := "Hello Knowtfolio!"
	content := []byte("<div> Hello HTML! </div>")
	actual := NewArticle(orgTitle, content, common.BigToAddress(big.NewInt(0)).String())

	actual.SetTitleIfPresent(nil)
	assert.Equal(t, orgTitle, actual.Title, "Title should not be changed when nil is given.")

	newTitle := "New Title!"
	actual.SetTitleIfPresent(&newTitle)
	assert.Equal(t, newTitle, actual.Title, "Title should be set by SetTitleIfPresent.")
}

func TestSetContentIfPresent(t *testing.T) {
	title := "Hello Knowtfolio!"
	orgContent := "<div> Hello HTML! </div>"
	actual := NewArticle(title, []byte(orgContent), common.BigToAddress(big.NewInt(0)).String())

	actual.SetContentIfPresent(nil)
	assert.Equal(t, []byte(orgContent), actual.Content, "Content should not be changed when nil is given.")

	newContent := "<div> New Content! </div>"
	actual.SetContentIfPresent(&newContent)
	assert.Equal(t, newContent, string(actual.Content), "Content should be set by SetContentIfPresent.")
}

func TestToHtml(t *testing.T) {
	src := Article{
		ID:        "abcdefghijk",
		Title:     "Hello Knowtfolio!",
		Content:   []byte("<div> Hello HTML! </div>"),
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
				<h1> Hello Knowtfolio! </h1>
				<div> Hello HTML! </div>
			</body>`

	assert.Equal(t, strings.Fields(expected), strings.Fields(string(actual)))
}
