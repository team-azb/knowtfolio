package models

type PublicUserInfo struct {
	UserName  string `json:"username"`
	Website   string `json:"website"`
	Picture   string `json:"picture"`
	Biography string `json:"biography"`
}
