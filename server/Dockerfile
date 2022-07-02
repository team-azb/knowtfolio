FROM golang:1.18.3

WORKDIR /server

ARG GOPATH=/go

RUN mkdir /scripts \
    && wget 'https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh' -P /scripts  \
    && chmod 755 /scripts/wait-for-it.sh

COPY go.mod go.sum /server/
RUN go mod download
