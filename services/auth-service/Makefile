.PHONY: help test build run clean deps

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

deps: ## Download dependencies
	go mod download
	go mod tidy

test: ## Run tests
	go test -v -race -coverprofile=coverage.out ./...

test-coverage: test ## Run tests with coverage report
	go tool cover -html=coverage.out -o coverage.html

build: ## Build the binary
	go build -o bin/auth-service ./cmd/server

run: ## Run the service
	go run ./cmd/server/main.go

clean: ## Clean build artifacts
	rm -rf bin/
	rm -f coverage.out coverage.html

lint: ## Run linter
	golangci-lint run

docker-build: ## Build Docker image
	docker build -t puzzle-auth-service:latest .

docker-run: ## Run in Docker
	docker-compose up auth-service
