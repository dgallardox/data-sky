from typing import List, Dict, Any
from .base_scraper import BaseScraper
import schedule
import time
import threading
from datetime import datetime
import json
import os


class ScraperManager:
    
    def __init__(self):
        self.scrapers: Dict[str, BaseScraper] = {}
        self.is_running = False
        self.scheduler_thread = None
        self.last_run = None
        self.results = []
        self.config_file = 'data/scraper_config.json'
        self.load_runtime_config()
        
    def load_runtime_config(self):
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r') as f:
                    self.runtime_config = json.load(f)
            except:
                self.runtime_config = {}
        else:
            self.runtime_config = {}
    
    def save_runtime_config(self):
        os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
        with open(self.config_file, 'w') as f:
            json.dump(self.runtime_config, f, indent=2)
    
    def register_scraper(self, scraper: BaseScraper):
        self.scrapers[scraper.name] = scraper
        if scraper.name in self.runtime_config:
            scraper.update_config(self.runtime_config[scraper.name])
        
    def remove_scraper(self, scraper_name: str):
        if scraper_name in self.scrapers:
            del self.scrapers[scraper_name]
        
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
            for name, scraper in self.scrapers.items():
                if hasattr(scraper, 'config') and not scraper.config.get('enabled', True):
                    continue
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Running scraper: {name}")
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
        
        # For run-all operations, create a combined result entry
        if len(results) > 1:
            # Add individual results
            self.results.extend(results)
            
            # Create combined "Run All" result
            total_items = sum(r.get('data_count', 0) for r in results if r['status'] == 'success')
            successful_scrapers = [r['scraper'] for r in results if r['status'] == 'success']
            failed_scrapers = [r['scraper'] for r in results if r['status'] != 'success']
            
            combined_status = 'success' if all(r['status'] == 'success' for r in results) else 'partial_success' if successful_scrapers else 'error'
            
            combined_result = {
                "scraper": "Run All",
                "scrapers": [r['scraper'] for r in results],  # All scrapers that ran
                "successful_scrapers": successful_scrapers,
                "failed_scrapers": failed_scrapers,
                "status": combined_status,
                "data_count": total_items,
                "timestamp": datetime.now().isoformat(),
                "run_type": "batch"
            }
            
            self.results.append(combined_result)
        else:
            # Single scraper run
            self.results.extend(results)
        
        # Keep only last 15 results (increased to accommodate batch + individual results)
        if len(self.results) > 15:
            self.results = self.results[-15:]
        
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
    
    def run_single_scraper(self, scraper_name: str) -> Dict[str, Any]:
        if scraper_name not in self.scrapers:
            raise ValueError(f"Scraper '{scraper_name}' not found")
        
        scraper = self.scrapers[scraper_name]
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Running single scraper: {scraper_name}")
        
        try:
            raw_data = scraper.scrape()
            if scraper.validate_data(raw_data):
                filtered_data = scraper.filter_data(raw_data)
                formatted_data = scraper.convert_to_common_format(filtered_data)
                filename = scraper.export_to_json(formatted_data)
                
                result = {
                    "scraper": scraper_name,
                    "status": "success",
                    "data_count": len(filtered_data),
                    "filename": filename,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                result = {
                    "scraper": scraper_name,
                    "status": "validation_failed",
                    "timestamp": datetime.now().isoformat()
                }
        except Exception as e:
            result = {
                "scraper": scraper_name,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        
        # Update manager state so result shows in Recent Results
        self.last_run = datetime.now()
        self.results.append(result)
        # Keep only last 10 results
        if len(self.results) > 10:
            self.results = self.results[-10:]
        
        return result
    
    def get_scraper_config(self, scraper_name: str) -> Dict[str, Any]:
        if scraper_name in self.scrapers:
            scraper = self.scrapers[scraper_name]
            if hasattr(scraper, 'get_config'):
                return scraper.get_config()
        return {}
    
    def update_scraper_config(self, scraper_name: str, config: Dict[str, Any]):
        if scraper_name in self.scrapers:
            scraper = self.scrapers[scraper_name]
            if hasattr(scraper, 'update_config'):
                scraper.update_config(config)
                self.runtime_config[scraper_name] = config
                self.save_runtime_config()
    
    def get_scraper_stats(self, scraper_name: str) -> Dict[str, Any]:
        if scraper_name in self.scrapers:
            scraper = self.scrapers[scraper_name]
            if hasattr(scraper, 'get_stats'):
                return scraper.get_stats()
        return {}
    
    def get_all_scrapers_info(self) -> List[Dict[str, Any]]:
        scrapers_info = []
        for name, scraper in self.scrapers.items():
            if hasattr(scraper, 'get_stats'):
                scrapers_info.append(scraper.get_stats())
            else:
                scrapers_info.append({
                    'name': name,
                    'display_name': name.title(),
                    'enabled': True
                })
        return scrapers_info
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "scrapers_count": len(self.scrapers),
            "scrapers": self.get_all_scrapers_info(),
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "last_results": self.results
        }