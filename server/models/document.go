package models

import (
	"fmt"
	"time"

	"github.com/aidarkhanov/nanoid/v2"
	"github.com/microcosm-cc/bluemonday"
)

type DocumentType string

const (
	ArticleType DocumentType = "ARTICLE"
)

type Document struct {
	ID        string       `gorm:"primarykey"`
	OwnerID   string       `gorm:"not null"`
	OwnerType DocumentType `gorm:"not null; enum('ARTICLE')"`
	Title     string       `gorm:"not null"`
	Content   []byte       `gorm:"not null"`
	RawText   string       `gorm:"not null; type:text"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

var htmlSanitizer = bluemonday.UGCPolicy()
var rawContentSanitizer = bluemonday.StripTagsPolicy()

func NewDocument(parentID string, parentType DocumentType, title string, content []byte) *Document {
	id, _ := nanoid.GenerateString(nanoid.DefaultAlphabet, 11)
	doc := Document{
		ID:        id,
		OwnerID:   parentID,
		OwnerType: parentType,
		Title:     title,
		Content:   content,
	}
	doc.reloadRawText()
	return &doc
}

func (d *Document) SetTitleIfPresent(title *string) {
	if title != nil {
		d.Title = *title
		d.reloadRawText()
	}
}

func (d *Document) SetContentIfPresent(content *string) {
	if content != nil {
		d.Content = []byte(*content)
		d.reloadRawText()
	}
}

func (d *Document) reloadRawText() {
	rawContent := rawContentSanitizer.Sanitize(string(d.Content))
	d.RawText = fmt.Sprintf("%s\n%s", d.Title, rawContent)
}

func (d *Document) SanitizedContent() []byte {
	return htmlSanitizer.SanitizeBytes(d.Content)
}
