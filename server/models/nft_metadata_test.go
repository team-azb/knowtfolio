package models

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestToJSON(t *testing.T) {
	src := NewNFTMetadata(Article{ID: "abcdefghijk"})
	actual, err := src.ToJSON()

	expected := `
			{
				"name": "Knowtfolio Article abcdefghijk",
				"description": "The owner of this token has ownership and editorial rights to article abcdefghijk on Knowtfolio.",
				"external_url": "https://knowtfolio.com/articles/abcdefghijk", 
				"image": "https://i.imgur.com/n9peHW2.png"
			}`

	assert.NoError(t, err)
	assert.JSONEq(t, expected, string(actual))
}
