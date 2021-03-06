GOA_DIR = server/gateways/api
GOA_DESIGN_DIR = $(GOA_DIR)/design
GOA_GEN_DIR = $(GOA_DIR)/gen
GOA_DOCKER_FILE = server/goa.Dockerfile

HARDHAT_BUILD_DIRS = blockchain/artifacts blockchain/cache blockchain/typechain

BLOCKCHAIN_NODE_MODULES_DIR = blockchain/node_modules

CONTRACT_SOL_FILE = blockchain/contracts/Knowtfolio.sol
CONTRACT_JSON_FILE = blockchain/artifacts/contracts/Knowtfolio.sol/Knowtfolio.json
CONTRACT_ABI_FILE = $(CONTRACT_JSON_FILE:.json=.abi)
CONTRACT_BIN_FILE = $(CONTRACT_JSON_FILE:.json=.bin)

GO_ETH_BINDING_PATH = server/gateways/ethereum/binding.go

HOST_UID = $(shell id -u ${USER})
HOST_GID = $(shell id -g ${USER})

# This exports all the variables defined above.
.EXPORT_ALL_VARIABLES:

$(GOA_GEN_DIR): $(GOA_DESIGN_DIR) $(GOA_DOCKER_FILE) ./server/go.mod
	docker-compose up --build goa

$(BLOCKCHAIN_NODE_MODULES_DIR): ./blockchain/package.json ./blockchain/Dockerfile
	docker-compose build hardhat
	docker-compose run hardhat npm --prefix ./blockchain install

$(CONTRACT_JSON_FILE): $(CONTRACT_SOL_FILE) $(BLOCKCHAIN_NODE_MODULES_DIR)
	docker-compose run hardhat npm --prefix ./blockchain run build

# Extract abi field from `$(CONTRACT_JSON_FILE)`.
$(CONTRACT_ABI_FILE): $(CONTRACT_JSON_FILE)
	docker-compose run hardhat \
    	/bin/bash -c "cat $(CONTRACT_JSON_FILE) | jq '.abi' > $(CONTRACT_ABI_FILE)"

# Extract bytecode field from `$(CONTRACT_JSON_FILE)`.
$(CONTRACT_BIN_FILE): $(CONTRACT_JSON_FILE)
	docker-compose run hardhat \
    	/bin/bash -c "cat $(CONTRACT_JSON_FILE) | jq -r '.bytecode' > $(CONTRACT_BIN_FILE)"

$(GO_ETH_BINDING_PATH): $(CONTRACT_ABI_FILE) $(CONTRACT_BIN_FILE)
	docker-compose up --build go-eth-binding

.PHONY: clean goa server test go-eth-binding

go-eth-binding: $(GO_ETH_BINDING_PATH)

goa: $(GOA_GEN_DIR)

server: goa go-eth-binding
	docker-compose up --build server

test: goa go-eth-binding
	docker-compose up --build test

clean:
	rm -rf $(GOA_GEN_DIR) $(HARDHAT_BUILD_DIRS) $(GO_ETH_BINDING_PATH) $(BLOCKCHAIN_NODE_MODULES_DIR)
	docker-compose down
