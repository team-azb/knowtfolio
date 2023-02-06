package models

import (
	"bytes"
	"html/template"
	"os"
	"path/filepath"

	"github.com/aidarkhanov/nanoid/v2"
)

type Article struct {
	ID               string   `gorm:"primarykey"`
	Document         Document `gorm:"polymorphic:Owner; polymorphicValue:ARTICLE"`
	OriginalAuthorID string   `gorm:"not null"`
	IsTokenized      bool     `gorm:"not null"`
}

func NewArticle(title string, content []byte, authorID string) *Article {
	id, _ := nanoid.GenerateString(nanoid.DefaultAlphabet, 11)
	doc := NewDocument(id, ArticleType, title, content)
	return &Article{
		ID:               id,
		Document:         *doc,
		OriginalAuthorID: authorID,
		IsTokenized:      false,
	}
}

func (a *Article) SetIsTokenized() {
	a.IsTokenized = true
}

var (
	WorkingDir, _ = os.Getwd()
	TemplatePath  = filepath.Join(WorkingDir, "/static/article_template.html")
)

func (a *Article) ToHTML() ([]byte, error) {
	htmlTemplate, err := template.
		ParseFiles(TemplatePath)
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
