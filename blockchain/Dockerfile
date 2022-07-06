FROM node:16.3-alpine

WORKDIR /work

RUN npm install --save-dev typescript ts-node hardhat
RUN apk update && \
    apk upgrade && \
    # Necessary packages for npm to work
    apk add alpine-sdk python3 && \
    # Need jq to extract abi from hardhat artifacts.
    apk add jq
