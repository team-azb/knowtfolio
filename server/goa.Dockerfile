FROM golang:1.18.3

WORKDIR /server

ARG GOPATH=/go

RUN apt-get update && \
    # Necessary packages for entrypoint.sh
    apt-get -y install gosu bash

RUN go install goa.design/goa/v3/cmd/goa@v3

COPY go.mod /server/
