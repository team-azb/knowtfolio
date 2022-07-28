package models

import (
	"bytes"
	"html/template"
	"time"

	"github.com/aidarkhanov/nanoid/v2"
	"github.com/microcosm-cc/bluemonday"
)

type Article struct {
	ID                    string `gorm:"primarykey"`
	Title                 string `gorm:"index:search_idx,class:FULLTEXT"`
	Content               []byte
	RawText               string `gorm:"index:search_idx,class:FULLTEXT"`
	OriginalAuthorAddress string
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

var htmlSanitizer = bluemonday.UGCPolicy()
var rawTextSanitizer = bluemonday.StripTagsPolicy()

func NewArticle(title string, content []byte, authorAddress string) *Article {
	id, _ := nanoid.GenerateString(nanoid.DefaultAlphabet, 11)
	rawText := rawTextSanitizer.Sanitize(string(content))
	return &Article{ID: id, Title: title, Content: content, RawText: rawText, OriginalAuthorAddress: authorAddress}
}

func (a *Article) SetTitleIfPresent(title *string) {
	if title != nil {
		a.Title = *title
	}
}

func (a *Article) SetContentIfPresent(content *string) {
	if content != nil {
		a.Content = []byte(*content)
		a.RawText = rawTextSanitizer.Sanitize(*content)
	}
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
				<h1> {{ .title }} </h1>
				{{ .content }}
			</body>
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
