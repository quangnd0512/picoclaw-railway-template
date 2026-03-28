IMAGE_NAME := clawbot-be:latest
CONTAINER_NAME := clawbot-be
PORT := 8080
ADMIN_PASSWORD ?= test

.PHONY: build run stop clean

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run --rm -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):8080 \
		-e PORT=8080 \
		-e ADMIN_PASSWORD=$(ADMIN_PASSWORD) \
		-v $(CURDIR)/.tmpdata:/data \
		$(IMAGE_NAME)
	@echo "Container started. Access at http://localhost:$(PORT)"

stop:
	docker stop $(CONTAINER_NAME)

clean:
	docker rmi $(IMAGE_NAME)
