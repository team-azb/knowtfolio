package models

import (
	"github.com/stretchr/testify/assert"
	"path/filepath"
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

	// テスト実行時のディレクトリが本番実行とは異なるので、TemplateDirを直接上書きしてtemplateファイルのパスを指定
	root, _ := filepath.Abs("../")
	TemplateDir = root + "/static"
	actual, err := src.ToHTML()
	assert.NoError(t, err)

	expected := `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Ubuntu&display=swap" rel="stylesheet"><title>Knowtfolio</title><link href="/main.css" rel="stylesheet"></head><body><div id="app"><div>metamaskに接続してください</div></div><script defer="defer" src="/ssr.js"></script></body></html>`

	assert.Equal(t, strings.Fields(expected), strings.Fields(string(actual)))

}
