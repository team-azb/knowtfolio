package models

import (
	"encoding/json"
	"github.com/go-playground/validator/v10"
)

var requestValidator = validator.New()

// ValidateJSONRequest unmarshal srcJSON into the type of distStruct,
// and then validate the struct using requestValidator.
func ValidateJSONRequest(srcJSON []byte, distStruct interface{}) error {
	err := json.Unmarshal(srcJSON, distStruct)
	if err != nil {
		return err
	}
	err = requestValidator.Struct(distStruct)
	return err
}
