# Data Sky

A Python server with React dashboard for scraping data from multiple sources, filtering, and exporting to JSON format.

## Features

- **Extensible Strategy Pattern**: Easy to add new data sources and scraping methods
- **Daily Scheduling**: Automatic scraping at midnight
- **Beautiful Dashboard**: Sky blue themed Material-UI interface
- **Server Control**: Start/stop server and run scrapers on-demand
- **Configurable Settings**: Change server port from the UI

## Installation

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Architecture

- **Backend**: Flask server with strategy pattern for scrapers
- **Frontend**: React with Material-UI components
- **Scheduling**: Python schedule library for daily runs
- **Data Storage**: JSON files in the data directory

## Adding New Scrapers

Create a new scraper by extending `BaseScraper`:

```python
from scrapers.base_scraper import BaseScraper

class MyCustomScraper(BaseScraper):
    def __init__(self):
        super().__init__("MyCustomScraper")
    
    def scrape(self):
        # Implementation
        pass
    
    def validate_data(self, data):
        # Validation logic
        pass
```

Then register it with the `ScraperManager` in `app.py`.