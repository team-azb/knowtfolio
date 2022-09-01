FROM node:18.0.0

WORKDIR /client

RUN apt update -y && \
    apt upgrade -y && \
    # Necessary packages for npm to work
    apt install -y build-essential

RUN apt-get update && \
    # Necessary packages for entrypoint.sh
    apt-get -y install gosu bash
