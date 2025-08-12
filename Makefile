
.PHONY: start backend frontend

start: backend frontend

backend:
	cd ./backend && python app.py &

frontend:
	lsof -ti tcp:3000 | xargs kill -9 || true
	cd ./frontend && [ -d node_modules ] || npm ci
	cd ./frontend && npm start &
