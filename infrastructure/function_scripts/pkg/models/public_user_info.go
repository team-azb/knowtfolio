package models

type UserInfo struct {
	UserName      string `json:"username"`
	WebsiteUrl    string `json:"website_url"`
	IconUrl       string `json:"icon_url"`
	Biography     string `json:"biography"`
	WalletAddress string `json:"wallet_address"`
}
