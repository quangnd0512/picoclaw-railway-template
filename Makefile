IMAGE_NAME := clawbot-be:latest
CONTAINER_NAME := clawbot-be
PORT := 8080
ADMIN_PASSWORD ?= test

.PHONY: build run stop logs shell test test-unit test-integration clean clean-data rebuild

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run --rm -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):8080 \
		-e PORT=8080 \
		-e ADMIN_PASSWORD=$(ADMIN_PASSWORD) \
		-v clawbot-data:/data \
		$(IMAGE_NAME)
	@echo "Container started. Access at http://localhost:$(PORT)"
	@echo "Admin password: $(ADMIN_PASSWORD)"

stop:
	-docker stop $(CONTAINER_NAME) 2>/dev/null || true

logs:
	docker logs -f $(CONTAINER_NAME)

shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh

test: test-unit test-integration

test-unit:
	@echo "Running unit tests..."
	@. .venv/bin/activate && python -m pytest tests/ -v -m "not integration" --tb=short

test-integration:
	@echo "Running integration tests (requires running container)..."
	@. .venv/bin/activate && python -m pytest tests/ -v -m integration --tb=short

clean:
	-docker stop $(CONTAINER_NAME) 2>/dev/null || true
	docker rmi $(IMAGE_NAME)

clean-data:
	-docker stop $(CONTAINER_NAME) 2>/dev/null || true
	docker volume rm clawbot-data

rebuild: stop clean build run
