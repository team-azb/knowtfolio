GOA_DIR = server/gateways/api
GOA_DESIGN_DIR = $(GOA_DIR)/design
GOA_GEN_DIR = $(GOA_DIR)/gen
GOA_DOCKER_FILE = ./server/goa.Dockerfile

HARDHAT_BUILD_DIRS = ./blockchain/artifacts ./blockchain/cache ./blockchain/typechain

CONTRACT_SOL_FILE = ./blockchain/contracts/Knowtfolio.sol
CONTRACT_JSON_FILE = ./blockchain/artifacts/contracts/Knowtfolio.sol/Knowtfolio.json
CONTRACT_ABI_FILE = $(CONTRACT_JSON_FILE:.json=.abi)

GO_ETH_BINDING_RELATIVE_PATH = server/gateways/ethereum/contract_client.go

.PHONY: goa server go-eth-binding

$(GOA_GEN_DIR): $(GOA_DESIGN_DIR) $(GOA_DOCKER_FILE) ./server/go.mod
	docker build -t knowtfolio/goa-gen -f $(GOA_DOCKER_FILE) ./server
	docker run -v `pwd`/$(GOA_DIR):/$(GOA_DIR) knowtfolio/goa-gen \
		/go/bin/goa gen github.com/team-azb/knowtfolio/$(GOA_DESIGN_DIR) \
		-o /$(GOA_DIR)

$(CONTRACT_ABI_FILE): $(CONTRACT_SOL_FILE)
	docker build -t knowtfolio/hardhat ./blockchain
	docker run -v `pwd`/blockchain:/work/blockchain knowtfolio/hardhat \
		npm run --prefix ./blockchain build
	# Extract abi field from `CONTRACT_JSON_FILE`.
	cat $(CONTRACT_JSON_FILE) | jq '.abi' > $(CONTRACT_ABI_FILE)

go-eth-binding: $(CONTRACT_ABI_FILE)
	docker run -v `pwd`/blockchain:/blockchain \
		-v `pwd`/server:/server \
		ethereum/client-go:alltools-v1.10.20 \
		abigen --abi $(CONTRACT_ABI_FILE) --pkg ethereum \
			--type ContractClient --out /$(GO_ETH_BINDING_RELATIVE_PATH)

goa: $(GOA_GEN_DIR)

server: goa go-eth-binding
	docker-compose up --build server

clean:
	rm -rf $(GOA_GEN_DIR) $(HARDHAT_BUILD_DIRS) ./$(GO_ETH_BINDING_RELATIVE_PATH)

client-server:
	cd client && npm start
