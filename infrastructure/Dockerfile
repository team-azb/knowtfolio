FROM --platform=linux/amd64 hashicorp/terraform:1.2.8

# Install Golang to compile lambda codes.
RUN apk add --no-cache git make musl-dev zip openssl aws-cli
RUN wget https://dl.google.com/go/go1.18.3.linux-amd64.tar.gz
RUN tar -C /usr/local -xzf go1.18.3.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:${PATH}"

# This is to make Golang work on alpine linux.
# Ref: https://blog.kozakana.net/2019/09/go-binary-not-found/
RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2
