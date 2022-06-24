GOA_DIR = server/gateways/api
GOA_DESIGN_DIR = $(GOA_DIR)/design
GOA_GEN_DIR = $(GOA_DIR)/gen

.PHONY: goa

$(GOA_GEN_DIR): $(GOA_DESIGN_DIR)
	docker build -f $(GOA_DIR)/Dockerfile -t knowtfolio/goa-gen ./server
	docker run -v `pwd`/$(GOA_DIR):/$(GOA_DIR) knowtfolio/goa-gen \
		/go/bin/linux_amd64/goa gen github.com/team-azb/knowtfolio/$(GOA_DESIGN_DIR) \
		-o /$(GOA_DIR)

goa: $(GOA_GEN_DIR)

clean:
	rm -rf $(GOA_GEN_DIR)
