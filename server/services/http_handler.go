package services

import (
	goahttp "goa.design/goa/v3/http"
	"goa.design/goa/v3/http/middleware"
	"net/http"
)

// HttpHandler is a wrapper struct of goahttp.Muxer which corresponds to a single HTTP server.
type HttpHandler struct {
	goahttp.Muxer
}

// httpService is an interface for each service structs generated by Goa.
type httpService interface {
	Use(func(handler http.Handler) http.Handler)
	Mount(goahttp.Muxer)
}

func NewHttpHandler() *HttpHandler {
	return &HttpHandler{Muxer: goahttp.NewMuxer()}
}

// AddService mounts a single httpService to HttpHandler.
//
// Before the service is mounted, it is wrapped by a logger middleware.
// This enables logging of all HTTP requests.
func (h *HttpHandler) AddService(s httpService, name string) {
	s.Use(middleware.Log(NewLogger(name, true)))
	s.Mount(h.Muxer)
}
