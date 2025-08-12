
.PHONY: start backend frontend

dev: backend frontend

backend:
	lsof -ti tcp:8937 | xargs kill -9 || true
	cd ./backend && python3 app.py &

frontend:
	lsof -ti tcp:8936 | xargs kill -9 || true
	cd ./frontend && [ -d node_modules ] || npm ci
	cd ./frontend && npm start &
