package models

import (
	"encoding/json"
	"fmt"
	"net/url"
)

type NFTMetadata struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	ExternalURL url.URL `json:"-"`
	Image       url.URL `json:"-"`
}

func NewNFTMetadata(target Article) NFTMetadata {
	name := fmt.Sprintf("Knowtfolio Article %v", target.ID)
	description := fmt.Sprintf("The owner of this token has ownership and editorial rights to article %v on Knowtfolio.", target.ID)
	articlePath := fmt.Sprintf("/articles/%v", target.ID)
	return NFTMetadata{
		Name:        name,
		Description: description,
		ExternalURL: url.URL{Scheme: "https", Host: "knowtfolio.com", Path: articlePath},
		Image:       url.URL{Scheme: "https", Host: "i.imgur.com", Path: "/n9peHW2.png"},
	}
}

func (m *NFTMetadata) ToJSON() ([]byte, error) {
	type Alias struct {
		*NFTMetadata
		ExternalURLStr string `json:"external_url"`
		ImageStr       string `json:"image"`
	}
	return json.Marshal(&Alias{
		NFTMetadata:    m,
		ExternalURLStr: m.ExternalURL.String(),
		ImageStr:       m.Image.String(),
	})
}
