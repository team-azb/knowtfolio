FROM node:16.3-alpine

WORKDIR /work

RUN npm install --save-dev hardhat
RUN apk update && \
    apk upgrade && \
    apk add jq
