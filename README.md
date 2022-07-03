# Knowtfolio
Blogging platform that leverages NFT to grow, buy and sell articles.

Many online articles on development techniques are not continuously updated.
This is because, in many services, articles have to be maintained by one author for the rest of their lives.

Knowtfolio solves this problem by making it possible to transfer editing rights using NFT.

## Technologies
* [Polygon](https://polygon.technology): Ethereum Platform
* [React.js](https://reactjs.org): Client Application
* [Golang](https://go.dev): Server Application
* [Solidity](https://solidity-jp.readthedocs.io): Smart Contracts
* [Hardhat](https://hardhat.org): Contract Compilation

## Smart Contracts
* https://mumbai.polygonscan.com/address/0xAA84102b3Ae46Db17C7264F0DC3F615Ce7DFB24B

## Challenges We Faced
* Authentication and authorization by Metamask signature on the server side.
  * https://github.com/team-azb/knowtfolio/blob/hacker-house/server/services/articles.go#L153-L174
* Verification of article owner by NFT.
  * Contract: https://github.com/team-azb/knowtfolio/blob/hacker-house/blockchain/contracts/Knowtfolio.sol#L82-L92
  * Server: https://github.com/team-azb/knowtfolio/blob/hacker-house/server/services/articles.go#L176-L196

## Future Plans
* Add nonce to each signature messages.
* Pretty NFT using ERC721 Metadata JSON Schema.
* Auctions for article NFTs.


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
