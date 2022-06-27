package services

import (
	"fmt"
	"github.com/rs/zerolog"
	"os"
)

// Logger is an adapted zerologger
type logger struct {
	*zerolog.Logger
}

// New creates a new zerologger
func NewLogger(serviceName string, isDebug bool) *logger {
	newLogger := zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout})
	if isDebug {
		newLogger = newLogger.Output(zerolog.ConsoleWriter{Out: os.Stdout})
	}
	inner := newLogger.With().
		Timestamp().
		Str("service", serviceName).
		Logger()
	return &logger{&inner}
}

// Log is called by the log middleware to log HTTP requests key values
func (l *logger) Log(keyvals ...interface{}) error {
	fields := formatFields(keyvals)
	l.Info().Fields(fields).Msgf("HTTP Request")
	return nil
}

// formatFields formats input keyvals
// ref: https://github.com/goadesign/goa/blob/v1/logging/logrus/adapter.go#L64
func formatFields(keyvals []interface{}) map[string]interface{} {
	n := (len(keyvals) + 1) / 2
	res := make(map[string]interface{}, n)
	for i := 0; i < len(keyvals); i += 2 {
		k := keyvals[i]
		var v interface{}
		if i+1 < len(keyvals) {
			v = keyvals[i+1]
		}
		res[fmt.Sprintf("%v", k)] = v
	}
	return res
}
