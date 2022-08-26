# Knowtfolio client
## Quick start
### 1. install dependencies
You need to install dependencies with npm.
```bash
npm install
```
### 2. generate artifacts
You also need to prepare `artifacts` directory to call smart contract.
```bash
cd ../blockchain # move to blockchain directory
npm run build    # generate artifacts in client directory
```
### 3. start server
```bash
cd ../client     # move back to client directory
npm start        # start client server
```