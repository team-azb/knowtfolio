FROM node:16.3

WORKDIR /work

RUN apt update -y && \
    apt upgrade -y && \
    # Necessary packages for npm to work
    apt install -y build-essential && \
    # Need jq to extract abi from hardhat artifacts.
    apt install -y jq

RUN apt-get update && \
    # Necessary packages for entrypoint.sh
    apt-get -y install gosu bash
