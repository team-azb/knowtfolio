package models

type FieldErrorCode string

const (
	InvalidFormat FieldErrorCode = "invalid_format"
	AlreadyExists FieldErrorCode = "already_exists"
)

type FieldError struct {
	FieldName string         `json:"field_name"`
	Code      FieldErrorCode `json:"code"`
}
