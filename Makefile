CLIENT_NODE_MODULES_DIR = client/node_modules
CLIENT_SRC_DIR = client/src
CLIENT_DIST_DIR = client/dist

SERVER_SRCS = $(wildcard server/*.go)
GOA_DIR = server/gateways/api
GOA_DESIGN_DIR = $(GOA_DIR)/design
GOA_GEN_DIR = $(GOA_DIR)/gen
GOA_DOCKER_FILE = server/goa.Dockerfile

GO_ETH_BINDING_PATH = server/gateways/ethereum/binding.go

HARDHAT_BUILD_DIRS = blockchain/artifacts blockchain/cache blockchain/typechain

BLOCKCHAIN_NODE_MODULES_DIR = blockchain/node_modules

CONTRACT_SOL_FILE = blockchain/contracts/Knowtfolio.sol
CONTRACT_JSON_FILE = blockchain/artifacts/contracts/Knowtfolio.sol/Knowtfolio.json
CONTRACT_ABI_FILE = $(CONTRACT_JSON_FILE:.json=.abi)
CONTRACT_BIN_FILE = $(CONTRACT_JSON_FILE:.json=.bin)

HOST_UID = $(shell id -u ${USER})
HOST_GID = $(shell id -g ${USER})

# This exports all the variables defined above.
.EXPORT_ALL_VARIABLES:

$(CLIENT_NODE_MODULES_DIR): ./client/package.json ./client/Dockerfile $(CONTRACT_JSON_FILE)
	docker-compose build client
	docker-compose run client npm install

$(CLIENT_DIST_DIR): ./client/webpack.config.js $(CLIENT_NODE_MODULES_DIR) $(CLIENT_SRC_DIR)
	docker-compose run client npm run build

$(GOA_GEN_DIR): $(GOA_DESIGN_DIR) $(GOA_DOCKER_FILE) ./server/go.mod
	docker-compose up --build goa
	cp -f $(GOA_GEN_DIR)/http/openapi3.yaml ./server

$(GO_ETH_BINDING_PATH): $(CONTRACT_ABI_FILE) $(CONTRACT_BIN_FILE)
	docker-compose up --build go-eth-binding

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

.PHONY: app client server goa test-sv checkfmt-sv go-eth-binding \
	init-tf fmt-tf checkfmt-tf plan-tf apply-tf clean

app: $(CLIENT_DIST_DIR) goa go-eth-binding
	docker-compose up --build client server


### Client ###

client: $(CLIENT_DIST_DIR)
	docker-compose up --build client

fmt-cl: $(CLIENT_NODE_MODULES_DIR) $(CLIENT_SRC_DIR)
	docker-compose run client npm run format

lint-cl: $(CLIENT_NODE_MODULES_DIR) $(CLIENT_SRC_DIR)
	docker-compose run client npm run lint


### Server ###

go-eth-binding: $(GO_ETH_BINDING_PATH)

goa: $(GOA_GEN_DIR)

server: goa go-eth-binding
	docker-compose up --build server

test: goa go-eth-binding
	docker-compose up --build test

checkfmt-sv: $(SERVER_SRCS)
	set -e ;\
    OUTPUT=$$(docker-compose run server gofmt -e -l .) ;\
    echo $$OUTPUT ;\
    test -z $$OUTPUT # Fail if there are some unformatted files.


### Infrastructure ###

init-tf:
	docker-compose run terraform init

fmt-tf:
	docker-compose run terraform fmt

checkfmt-tf:
	docker-compose run terraform fmt -check

plan-tf:
	docker-compose run terraform plan

apply-tf:
	docker-compose run terraform apply

clean:
	rm -rf $(GOA_GEN_DIR) $(HARDHAT_BUILD_DIRS) $(GO_ETH_BINDING_PATH) $(BLOCKCHAIN_NODE_MODULES_DIR) $(CLIENT_DIST_DIR) $(CLIENT_NODE_MODULES_DIR)
	docker-compose down
