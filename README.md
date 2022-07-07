# Knowtfolio
Blogging platform that leverages NFT to grow, buy and sell articles.

Many online articles on development techniques are not continuously updated.
This is because, in many services, articles have to be maintained by one author for the rest of their lives.

Knowtfolio solves this problem by making it possible to transfer editing rights using NFT.

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

## Technologies
* [Polygon](https://polygon.technology): Ethereum Platform
* [React.js](https://reactjs.org): Client Application
* [Golang](https://go.dev): Server Application
* [Solidity](https://solidity-jp.readthedocs.io): Smart Contracts
* [Hardhat](https://hardhat.org): Contract Compilation

## Smart Contracts
* prod: https://mumbai.polygonscan.com/address/0xCd9554e90FCdC339F41F775c25b0EE00Add2b2ba
* dev: https://mumbai.polygonscan.com/address/0x1c63329065425B9FE585b14F48E6037795f52443
