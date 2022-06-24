FROM golang:1.18.3

WORKDIR /server

ARG CGO_ENABLED=0
ARG GOOS=linux
ARG GOARCH=amd64
ARG GOPATH=/go

RUN go install goa.design/goa/v3/cmd/goa@v3

COPY ../../go.mod /server/
