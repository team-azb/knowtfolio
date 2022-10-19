package models

import (
	"bytes"
	"github.com/aidarkhanov/nanoid/v2"
	"html/template"
)

type Article struct {
	ID                    string   `gorm:"primarykey"`
	Document              Document `gorm:"polymorphic:Owner; polymorphicValue:ARTICLE"`
	OriginalAuthorAddress string   `gorm:"not null"`
	IsTokenized           bool     `gorm:"not null"`
}

func NewArticle(title string, content []byte, authorAddress string) *Article {
	id, _ := nanoid.GenerateString(nanoid.DefaultAlphabet, 11)
	doc := NewDocument(id, ArticleType, title, content)
	return &Article{
		ID:                    id,
		Document:              *doc,
		OriginalAuthorAddress: authorAddress,
		IsTokenized:           false,
	}
}

func (a *Article) SetIsTokenized() {
	a.IsTokenized = true
}

func (a *Article) ToHTML() ([]byte, error) {
	htmlTemplate, err := template.
		New("HTML").
		Parse(`
			<head>
				<meta charset="UTF-8" />
				<title> {{ .title }} </title>
			</head>
			<body>
				<a href="/articles">記事一覧</a>
				<a href="/articles/{{ .id }}/edit">記事を編集</a>
				<h1> {{ .title }} </h1>
				{{ .content }}
			</body>
		`)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	err = htmlTemplate.Execute(&buf, map[string]interface{}{
		"title":   a.Document.Title,
		"id":      a.ID,
		"content": template.HTML(a.Document.SanitizedContent()),
	})
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
