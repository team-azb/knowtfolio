package models

import (
	"bytes"
	"github.com/aidarkhanov/nanoid/v2"
	"github.com/microcosm-cc/bluemonday"
	"html/template"
	"time"
)

type Article struct {
	ID        string `gorm:"primarykey"`
	Title     string
	Content   []byte
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewArticle(title string, content []byte) *Article {
	id, _ := nanoid.GenerateString(nanoid.DefaultAlphabet, 11)
	return &Article{ID: id, Title: title, Content: content}
}

func (a *Article) SetTitleIfPresent(title *string) {
	if title != nil {
		a.Title = *title
	}
}

func (a *Article) SetContentIfPresent(content *string) {
	if content != nil {
		a.Content = []byte(*content)
	}
}

var htmlSanitizer = bluemonday.UGCPolicy()

func (a *Article) ToHTML() ([]byte, error) {
	htmlTemplate, err := template.
		New("HTML").
		Parse(`
			<title> {{ .title }} </title>
			{{ .content }}
		`)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	err = htmlTemplate.Execute(&buf, map[string]interface{}{
		"title":   a.Title,
		"content": template.HTML(htmlSanitizer.SanitizeBytes(a.Content)),
	})
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}