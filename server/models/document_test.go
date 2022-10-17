package models

import (
	"github.com/stretchr/testify/assert"
	"strings"
	"testing"
)

func TestSetTitleIfPresent(t *testing.T) {
	orgTitle := "Hello Knowtfolio!"
	content := []byte("<div> Hello HTML! </div>")
	actual := NewDocument("", ArticleType, orgTitle, content)

	actual.SetTitleIfPresent(nil)
	assert.Equal(t, orgTitle, actual.Title, "Title should not be changed when nil is given.")

	newTitle := "New Title!"
	actual.SetTitleIfPresent(&newTitle)
	assert.Equal(t, newTitle, actual.Title, "Title should be set by SetTitleIfPresent.")
}

func TestSetContentIfPresent(t *testing.T) {
	title := "Hello Knowtfolio!"
	orgContent := "<div> Hello HTML! </div>"
	actual := NewDocument("", ArticleType, title, []byte(orgContent))

	actual.SetContentIfPresent(nil)
	assert.Equal(t, []byte(orgContent), actual.Content, "Content should not be changed when nil is given.")

	newContent := "<div> New Content! </div>"
	actual.SetContentIfPresent(&newContent)
	assert.Equal(t, newContent, string(actual.Content), "Content should be set by SetContentIfPresent.")
}

func TestSanitizedContent(t *testing.T) {
	rawContent := `
		<div> Hello HTML! </div>
		<img src="https://i.imgur.com/Ru0JifT.jpeg" alt="basketball legend" width="410" height="213">
		<a href="javascript:alert('XSS1')" onmouseover="alert('XSS2')"> XSS <a>
	`

	doc := NewDocument("", ArticleType, "", []byte(rawContent))

	expected := `
		<div> Hello HTML! </div>
		<img src="https://i.imgur.com/Ru0JifT.jpeg" alt="basketball legend" width="410" height="213">
		XSS
	`

	assert.Equal(t, strings.Fields(expected), strings.Fields(string(doc.SanitizedContent())))
}
