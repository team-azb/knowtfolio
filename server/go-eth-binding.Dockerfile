FROM ethereum/client-go:alltools-v1.10.20

RUN apk update && \
    # Necessary packages for entrypoint.sh
    apk add su-exec bash shadow
