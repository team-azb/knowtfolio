CLIENT_NODE_MODULES_DIR = client/node_modules
CLIENT_SRC_DIR = client/src
CLIENT_DIST_DIR = client/dist

SERVER_SRCS = $(wildcard server/*.go)
GOA_DIR = server/gateways/api
GOA_DESIGN_DIR = $(GOA_DIR)/design
GOA_GEN_DIR = $(GOA_DIR)/gen
GOA_DOCKER_FILE = server/goa.Dockerfile
CLIENT_SRCS = $(shell find $(CLIENT_SRC_DIR) -type f)
ARTICLE_PAGE_TEMPLATE = server/static/article_template.html

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
	docker compose build client
	docker compose run --rm client npm install
	# To avoid this target from running repeatedly when the `node_modules` dir is not updated by the command above.
	touch $(CLIENT_NODE_MODULES_DIR)

$(GOA_GEN_DIR): $(GOA_DESIGN_DIR) $(GOA_DOCKER_FILE) ./server/go.mod
	docker compose up --build goa
	cp -f $(GOA_GEN_DIR)/http/openapi3.yaml ./server

$(GO_ETH_BINDING_PATH): $(CONTRACT_ABI_FILE) $(CONTRACT_BIN_FILE)
	docker compose up --build go-eth-binding

$(BLOCKCHAIN_NODE_MODULES_DIR): ./blockchain/package.json ./blockchain/Dockerfile
	docker compose build hardhat
	docker compose run --rm hardhat npm --prefix ./blockchain install
	# To avoid this target from running repeatedly when the `node_modules` dir is not updated by the command above.
	touch $(BLOCKCHAIN_NODE_MODULES_DIR)

$(CONTRACT_JSON_FILE): $(CONTRACT_SOL_FILE) $(BLOCKCHAIN_NODE_MODULES_DIR)
	docker compose run --rm hardhat npm --prefix ./blockchain run build
	# To avoid this target from running repeatedly when the json is not updated by the command above.
	touch $(CONTRACT_JSON_FILE)

# Extract abi field from `$(CONTRACT_JSON_FILE)`.
$(CONTRACT_ABI_FILE): $(CONTRACT_JSON_FILE)
	docker compose run --rm hardhat \
    	/bin/bash -c "cat $(CONTRACT_JSON_FILE) | jq '.abi' > $(CONTRACT_ABI_FILE)"

# Extract bytecode field from `$(CONTRACT_JSON_FILE)`.
$(CONTRACT_BIN_FILE): $(CONTRACT_JSON_FILE)
	docker compose run --rm hardhat \
    	/bin/bash -c "cat $(CONTRACT_JSON_FILE) | jq -r '.bytecode' > $(CONTRACT_BIN_FILE)"

$(ARTICLE_PAGE_TEMPLATE): ./client/webpack.config.js $(CLIENT_SRC_DIR) $(CLIENT_NODE_MODULES_DIR)
	docker compose run --rm --no-deps client npm run build
	docker compose run --rm --no-deps client node dist/insertPageContent.js
	mv -f $(CLIENT_DIST_DIR)/article_template.html $(ARTICLE_PAGE_TEMPLATE)

# Binary file for production server execution
server/build/server: $(GOA_GEN_DIR) $(GO_ETH_BINDING_PATH)
	docker compose run --rm server go build -o build/server

.PHONY: app hardhat-bash client server goa test-sv checkfmt-sv go-eth-binding \
	init-tf fmt-tf checkfmt-tf plan-tf apply-tf clean

app: goa go-eth-binding $(CLIENT_NODE_MODULES_DIR) $(ARTICLE_PAGE_TEMPLATE)
	docker compose up --build client server

### BlockChain ###
hardhat-bash:
	docker-compose run hardhat bash

### Client ###

client: $(CLIENT_NODE_MODULES_DIR)
	docker compose up --build client

fmt-cl: $(CLIENT_NODE_MODULES_DIR)
	docker compose run --rm client npm run format

checkfmt-cl: $(CLIENT_NODE_MODULES_DIR)
	docker compose run --rm client npx prettier --check 'src/**/*.ts' 'src/**/*.tsx' 'src/**/*.html' 'src/**/*.css' 'webpack.*.js'

lint-cl: $(CLIENT_NODE_MODULES_DIR)
	docker compose run --rm client npm run lint


### Server ###

go-eth-binding: $(GO_ETH_BINDING_PATH)

goa: $(GOA_GEN_DIR)

server: goa go-eth-binding $(ARTICLE_PAGE_TEMPLATE)
	docker compose up --build server

test: goa go-eth-binding $(ARTICLE_PAGE_TEMPLATE)
	docker compose up --build --abort-on-container-exit test

checkfmt-sv: $(SERVER_SRCS)
	docker compose run --rm server test -z $$(gofmt -e -l .)

### Infrastructure ###

init-tf:
	docker compose run --rm terraform init

fmt-tf:
	docker compose run --rm terraform fmt

checkfmt-tf:
	docker compose run --rm terraform fmt -check

plan-tf:
	docker compose run --rm terraform plan

apply-tf: go-eth-binding
	docker compose run --rm terraform apply

clean:
	rm -rf $(GOA_GEN_DIR) $(HARDHAT_BUILD_DIRS) $(GO_ETH_BINDING_PATH) $(BLOCKCHAIN_NODE_MODULES_DIR) $(CLIENT_DIST_DIR) $(CLIENT_NODE_MODULES_DIR)
	docker compose down
