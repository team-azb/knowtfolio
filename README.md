# Knowtfolio
Blogging platform that leverages NFT to grow, buy and sell articles.

## Run

### Start Backend Server & Database
```bash
make server
```

### Generate OpenAPI docs
```bash
make goa
```
`./server/gateways/api/gen` will be generated.
The OpenAPI files will be in `./server/gateways/api/gen/html`.

### Clean up generated files
```bash
make clean
```
