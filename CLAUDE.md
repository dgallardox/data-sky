# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Data Sky is a Python Flask backend with React frontend for automated web scraping. The system uses a strategy pattern for extensible data sources and includes a dashboard for monitoring and control.

## Development Commands

### Backend (Flask Server)
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run server (default port 8937)
python app.py

# The server runs on port 8937 by default (unusual port to avoid conflicts)
```

### Frontend (React Dashboard)
```bash
# Install dependencies
cd frontend
npm install

# Start development server (port 8936)
npm start

# Build for production
npm build

# Run tests
npm test
```

## Architecture

### Backend Structure

The backend uses a **Strategy Pattern** for scrapers:
- `backend/scrapers/base_scraper.py`: Abstract base class defining the scraper interface
  - Methods: `scrape()`, `validate_data()`, `filter_data()`, `convert_to_common_format()`, `export_to_json()`
- `backend/scrapers/scraper_manager.py`: Manages all scrapers and scheduling
  - Handles daily scheduling at 12:00 PM
  - Thread-based scheduler that runs independently
  - Maintains scraper state and results

### API Endpoints

- `GET /api/status` - Returns server status, running state, and last results
- `POST /api/server/start` - Starts the scheduler (not the Flask server)
- `POST /api/server/stop` - Stops the scheduler
- `POST /api/server/run-now` - Manually trigger all scrapers
- `GET /api/settings` - Get current settings
- `POST /api/settings/port` - Update server port
- `GET /api/scrapers` - List registered scrapers

### Frontend Architecture

React app with Material-UI components:
- **API Communication**: `frontend/src/services/api.js` - Axios client configured for port 8937
- **State Management**: App.js manages global state with polling every 5 seconds
- **Theme**: Sky blue color palette (#4A90E2) defined in `styles/theme.js`

### Important Implementation Details

1. **Server vs Scheduler**: The on/off switch controls the scheduler (automatic daily scraping), NOT the Flask server. The Flask server must stay running for the dashboard to work.

2. **Port Configuration**: Default ports are 8937 (backend) and 8936 (frontend) to avoid conflicts with common services. Both are configured in their respective settings.

3. **Data Storage**: Scraped data is saved as JSON files in `backend/data/` directory (created automatically, gitignored).

4. **Scheduler Behavior**: 
   - Runs daily at 12:00 PM when active
   - Uses Python's `schedule` library with a separate daemon thread
   - Currently runs a placeholder that logs "No scrapers registered" since no scrapers are implemented yet

## Adding New Scrapers

To add a new scraper:

1. Create a new file in `backend/scrapers/` extending `BaseScraper`
2. Implement required methods: `scrape()` and `validate_data()`
3. Register the scraper in `backend/app.py` by importing and adding to `scraper_manager`

Example:
```python
from scrapers.my_scraper import MyScraper
scraper_manager.register_scraper(MyScraper())
```

## Environment Configuration

Backend uses `.env` file (gitignored):
```
SERVER_PORT=8937
SERVER_HOST=127.0.0.1
DEBUG=False
DATA_DIR=data
```

## Common Issues

- If port 8937 or 8936 is in use, update `backend/config/settings.py`, `frontend/package.json`, and `frontend/src/services/api.js`
- Dashboard shows "Scheduler Inactive" when Flask is running but scheduler thread is off
- "Run Now" button is disabled when scheduler is inactive - this is intentional

## Important Instructions

- **ALWAYS make a git commit after completing each task or prompt**, unless the user explicitly says not to commit
- Commits should have clear, descriptive messages explaining what changed
- Include the Claude Code attribution in commit messages