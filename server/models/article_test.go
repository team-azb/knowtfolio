package models

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
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

	// テスト実行時のディレクトリが本番実行とは異なるので、TemplateDirを直接上書きしてtemplateファイルのパスを指定
	root, _ := filepath.Abs("../")
	TemplatePath = filepath.Join(root, "/static/article_template.html")

	actual, err := src.ToHTML()
	assert.NoError(t, err)

	assert.Contains(t, string(actual), "<title>Knowtfolio</title>")
	assert.Contains(t, string(actual), "<div> Hello HTML! </div>")
	assert.Contains(t, string(actual), `<img src="https://i.imgur.com/Ru0JifT.jpeg" alt="basketball legend" width="410" height="213">`)
	assert.Contains(t, string(actual), "XSS")
	assert.NotContains(t, string(actual), `<a href="javascript:alert('XSS1')" onmouseover="alert('XSS2')"> XSS <a>`)
}
