from typing import List, Dict, Any
from .base_scraper import BaseScraper
import schedule
import time
import threading
from datetime import datetime


class ScraperManager:
    
    def __init__(self):
        self.scrapers: List[BaseScraper] = []
        self.is_running = False
        self.scheduler_thread = None
        self.last_run = None
        self.results = []
        
    def register_scraper(self, scraper: BaseScraper):
        self.scrapers.append(scraper)
        
    def remove_scraper(self, scraper_name: str):
        self.scrapers = [s for s in self.scrapers if s.name != scraper_name]
        
    def run_all_scrapers(self) -> List[Dict[str, Any]]:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Beginning data scraping process...")
        results = []
        
        if not self.scrapers:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] No scrapers registered - placeholder run")
            results.append({
                "scraper": "Placeholder",
                "status": "success",
                "data_count": 0,
                "message": "No scrapers configured yet",
                "timestamp": datetime.now().isoformat()
            })
        else:
            for scraper in self.scrapers:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Running scraper: {scraper.name}")
                try:
                    raw_data = scraper.scrape()
                    if scraper.validate_data(raw_data):
                        filtered_data = scraper.filter_data(raw_data)
                        formatted_data = scraper.convert_to_common_format(filtered_data)
                        filename = scraper.export_to_json(formatted_data)
                        
                        results.append({
                            "scraper": scraper.name,
                            "status": "success",
                            "data_count": len(filtered_data),
                            "filename": filename,
                            "timestamp": datetime.now().isoformat()
                        })
                        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {scraper.name} completed: {len(filtered_data)} items")
                    else:
                        results.append({
                            "scraper": scraper.name,
                            "status": "validation_failed",
                            "timestamp": datetime.now().isoformat()
                        })
                        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {scraper.name} validation failed")
                except Exception as e:
                    results.append({
                        "scraper": scraper.name,
                        "status": "error",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    })
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {scraper.name} error: {str(e)}")
        
        self.last_run = datetime.now()
        self.results = results
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scraping process completed. Total results: {len(results)}")
        return results
    
    def _scheduled_run(self):
        while self.is_running:
            schedule.run_pending()
            time.sleep(1)
    
    def start_scheduler(self):
        if not self.is_running:
            self.is_running = True
            schedule.clear()
            schedule.every().day.at("12:00").do(self.run_all_scrapers)
            self.scheduler_thread = threading.Thread(target=self._scheduled_run)
            self.scheduler_thread.daemon = True
            self.scheduler_thread.start()
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scheduler started - will run daily at 12:00 PM")
            return True
        return False
    
    def stop_scheduler(self):
        self.is_running = False
        schedule.clear()
        if self.scheduler_thread and self.scheduler_thread.is_alive():
            self.scheduler_thread.join(timeout=2)
        self.scheduler_thread = None
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scheduler stopped")
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "scrapers_count": len(self.scrapers),
            "scrapers": [s.name for s in self.scrapers],
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "last_results": self.results
        }