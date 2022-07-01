package models

import (
	"github.com/stretchr/testify/assert"
	"strings"
	"testing"
	"time"
)

func TestSetTitleIfPresent(t *testing.T) {
	orgTitle := "Hello Knowtfolio!"
	content := []byte("<h1> Hello HTML! </h1>")
	actual := NewArticle(orgTitle, content)

	actual.SetTitleIfPresent(nil)
	assert.Equal(t, orgTitle, actual.Title, "Title should not be changed when nil is given.")

	newTitle := "New Title!"
	actual.SetTitleIfPresent(&newTitle)
	assert.Equal(t, newTitle, actual.Title, "Title should be set by SetTitleIfPresent.")
}

func TestSetContentIfPresent(t *testing.T) {
	title := "Hello Knowtfolio!"
	orgContent := "<h1> Hello HTML! </h1>"
	actual := NewArticle(title, []byte(orgContent))

	actual.SetContentIfPresent(nil)
	assert.Equal(t, []byte(orgContent), actual.Content, "Content should not be changed when nil is given.")

	newContent := "<h1> New Content! </h1>"
	actual.SetContentIfPresent(&newContent)
	assert.Equal(t, newContent, string(actual.Content), "Content should be set by SetContentIfPresent.")
}

func TestToHtml(t *testing.T) {
	src := Article{
		ID:        "abcdefghijk",
		Title:     "Hello Knowtfolio!",
		Content:   []byte("<h1> Hello HTML! </h1>"),
		CreatedAt: time.Time{},
		UpdatedAt: time.Time{},
	}
	actual, err := src.ToHTML()
	assert.NoError(t, err)

	expected := "<title> Hello Knowtfolio! </title> <h1> Hello HTML! </h1>"

	assert.Equal(t, strings.Fields(expected), strings.Fields(string(actual)))
}
