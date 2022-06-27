GOA_DIR = server/gateways/api
GOA_DESIGN_DIR = $(GOA_DIR)/design
GOA_GEN_DIR = $(GOA_DIR)/gen
GOA_DOCKER_FILE = ./server/goa.Dockerfile

.PHONY: goa

$(GOA_GEN_DIR): $(GOA_DESIGN_DIR) $(GOA_DOCKER_FILE) ./server/go.mod
	docker build -t knowtfolio/goa-gen -f $(GOA_DOCKER_FILE) ./server
	docker run -v `pwd`/$(GOA_DIR):/$(GOA_DIR) knowtfolio/goa-gen \
		/go/bin/goa gen github.com/team-azb/knowtfolio/$(GOA_DESIGN_DIR) \
		-o /$(GOA_DIR)

goa: $(GOA_GEN_DIR)

clean:
	rm -rf $(GOA_GEN_DIR)

start-client:
	cd client && npm start

deploy-client:
	cd client && npm run deploy
