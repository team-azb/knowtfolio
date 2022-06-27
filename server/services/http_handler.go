package services

import (
	goahttp "goa.design/goa/v3/http"
	"goa.design/goa/v3/http/middleware"
	"net/http"
)

type HttpHandler struct {
	goahttp.Muxer
}

type httpService interface {
	Use(func(handler http.Handler) http.Handler)
	Mount(goahttp.Muxer)
}

func NewHttpHandler() *HttpHandler {
	return &HttpHandler{Muxer: goahttp.NewMuxer()}
}

func (h *HttpHandler) AddService(s httpService, name string) {
	s.Use(middleware.Log(NewLogger(name, true)))
	s.Mount(h.Muxer)
}
