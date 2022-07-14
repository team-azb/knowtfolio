FROM golang:1.18.3

WORKDIR /server

# Putting GOPATH under the WORKDIR makes entrypoint.sh `chown` the binaries,
# and that makes the binaries accessible from non-root user.
ENV GOPATH=/server/go

RUN apt-get update && \
    # Necessary packages for entrypoint.sh
    apt-get -y install gosu bash

RUN go install goa.design/goa/v3/cmd/goa@v3

COPY go.mod go.sum /server/
