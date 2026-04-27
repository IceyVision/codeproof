.PHONY: help install backend frontend dev

help:
	@echo "make backend   - run the Go backend on :8080"
	@echo "make frontend  - run the Next.js frontend on :3000"
	@echo "make dev       - run both in parallel (Ctrl+C stops both)"
	@echo "make install   - install backend + frontend deps"

install:
	cd backend && go mod tidy
	cd website && pnpm install

backend:
	cd backend && go run .

frontend:
	cd website && pnpm dev

dev:
	$(MAKE) -j2 backend frontend
