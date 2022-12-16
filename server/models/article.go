package models

import (
	"bytes"
	"html/template"

	"github.com/aidarkhanov/nanoid/v2"
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
		ParseFiles("dist/template.html")
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
