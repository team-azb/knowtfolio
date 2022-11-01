package models

import (
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
	Title     string       `gorm:"not null; index:search_idx,class:FULLTEXT"`
	Content   []byte       `gorm:"not null"`
	RawText   string       `gorm:"type:text not null; index:search_idx,class:FULLTEXT"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

var htmlSanitizer = bluemonday.UGCPolicy()
var rawTextSanitizer = bluemonday.StripTagsPolicy()

func NewDocument(parentID string, parentType DocumentType, title string, content []byte) *Document {
	id, _ := nanoid.GenerateString(nanoid.DefaultAlphabet, 11)
	rawText := rawTextSanitizer.Sanitize(string(content))
	return &Document{
		ID:        id,
		OwnerID:   parentID,
		OwnerType: parentType,
		Title:     title,
		Content:   content,
		RawText:   rawText,
	}
}

func (d *Document) SetTitleIfPresent(title *string) {
	if title != nil {
		d.Title = *title
	}
}

func (d *Document) SetContentIfPresent(content *string) {
	if content != nil {
		d.Content = []byte(*content)
		d.RawText = rawTextSanitizer.Sanitize(*content)
	}
}

func (d *Document) SanitizedContent() []byte {
	return htmlSanitizer.SanitizeBytes(d.Content)
}
