
.PHONY: dev backend frontend stop

dev: backend frontend
	@echo "✅ Data Sky is running!"
	@echo "   Backend:  http://localhost:8937"
	@echo "   Frontend: http://localhost:8936"

backend:
	@echo "Starting backend server..."
	@if lsof -ti tcp:8937 > /dev/null 2>&1; then \
		echo "  ⚠️  Found existing process on port 8937, stopping it..."; \
		lsof -ti tcp:8937 | xargs kill 2>/dev/null || true; \
		sleep 1; \
		lsof -ti tcp:8937 | xargs kill -9 2>/dev/null || true; \
		echo "  ✓ Stopped existing backend"; \
	fi
	@cd ./backend && python3 app.py &
	@echo "  ✓ Backend started on port 8937"

frontend:
	@echo "Starting frontend server..."
	@if lsof -ti tcp:8936 > /dev/null 2>&1; then \
		echo "  ⚠️  Found existing process on port 8936, stopping it..."; \
		lsof -ti tcp:8936 | xargs kill 2>/dev/null || true; \
		sleep 1; \
		lsof -ti tcp:8936 | xargs kill -9 2>/dev/null || true; \
		echo "  ✓ Stopped existing frontend"; \
	fi
	@cd ./frontend && [ -d node_modules ] || npm ci
	@cd ./frontend && npm start &
	@echo "  ✓ Frontend started on port 8936"

stop:
	@echo "Stopping Data Sky services..."
	@lsof -ti tcp:8937 | xargs kill 2>/dev/null && echo "  ✓ Stopped backend" || echo "  - No backend process found"
	@lsof -ti tcp:8936 | xargs kill 2>/dev/null && echo "  ✓ Stopped frontend" || echo "  - No frontend process found"
	@echo "✅ All services stopped"
