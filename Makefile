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

ENTRYPOINT_OPTS = -e HOST_UID=`id -u ${USER}` -e HOST_GID=`id -g ${USER}`

$(GOA_GEN_DIR): $(GOA_DESIGN_DIR) $(GOA_DOCKER_FILE) ./server/go.mod
	docker build -t knowtfolio/goa-gen -f $(GOA_DOCKER_FILE) ./server
	docker run $(ENTRYPOINT_OPTS) \
		-v `pwd`/entrypoint.sh:/server/entrypoint.sh \
		-v `pwd`/$(GOA_DIR):/$(GOA_DIR) \
		knowtfolio/goa-gen \
		/go/bin/goa gen github.com/team-azb/knowtfolio/$(GOA_DESIGN_DIR) \
		-o /$(GOA_DIR)

$(BLOCKCHAIN_NODE_MODULES_DIR): ./blockchain/package.json ./blockchain/Dockerfile
	docker-compose build hardhat
	docker-compose run $(ENTRYPOINT_OPTS) hardhat \
    	npm --prefix ./blockchain install

$(CONTRACT_JSON_FILE): $(CONTRACT_SOL_FILE) $(BLOCKCHAIN_NODE_MODULES_DIR)
	docker-compose run $(ENTRYPOINT_OPTS) hardhat \
    	npm --prefix ./blockchain run build

# Extract abi field from `$(CONTRACT_JSON_FILE)`.
$(CONTRACT_ABI_FILE): $(CONTRACT_JSON_FILE)
	docker-compose run $(ENTRYPOINT_OPTS) hardhat \
    	/bin/bash -c "cat $(CONTRACT_JSON_FILE) | jq '.abi' > $(CONTRACT_ABI_FILE)"

# Extract bytecode field from `$(CONTRACT_JSON_FILE)`.
$(CONTRACT_BIN_FILE): $(CONTRACT_JSON_FILE)
	docker-compose run $(ENTRYPOINT_OPTS) hardhat \
    	/bin/bash -c "cat $(CONTRACT_JSON_FILE) | jq -r '.bytecode' > $(CONTRACT_BIN_FILE)"

$(GO_ETH_BINDING_PATH): $(CONTRACT_ABI_FILE) $(CONTRACT_BIN_FILE)
	docker run -v `pwd`/blockchain:/blockchain \
		-v `pwd`/server:/server \
		ethereum/client-go:alltools-v1.10.20 \
		abigen --abi $(CONTRACT_ABI_FILE) --bin $(CONTRACT_BIN_FILE) --pkg ethereum \
			--type ContractBinding --out /$(GO_ETH_BINDING_PATH)

.PHONY: goa server test go-eth-binding

go-eth-binding: $(GO_ETH_BINDING_PATH)

goa: $(GOA_GEN_DIR)

server: goa go-eth-binding
	docker-compose up --build server

test: goa go-eth-binding
	docker-compose up --build test

clean:
	rm -rf $(GOA_GEN_DIR) $(HARDHAT_BUILD_DIRS) $(GO_ETH_BINDING_PATH) $(BLOCKCHAIN_NODE_MODULES_DIR)
