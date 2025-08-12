from abc import ABC, abstractmethod
from typing import Dict, List, Any
from datetime import datetime
import json


class BaseScraper(ABC):
    
    def __init__(self, name: str):
        self.name = name
        self.last_scraped = None
        
    @abstractmethod
    def scrape(self) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def validate_data(self, data: List[Dict[str, Any]]) -> bool:
        pass
    
    def filter_data(self, data: List[Dict[str, Any]], filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if not filters:
            return data
        
        filtered = data
        for key, value in filters.items():
            filtered = [item for item in filtered if key in item and item[key] == value]
        
        return filtered
    
    def convert_to_common_format(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "source": self.name,
            "timestamp": datetime.now().isoformat(),
            "data_count": len(data),
            "data": data
        }
    
    def export_to_json(self, data: Dict[str, Any], filename: str = None) -> str:
        if not filename:
            # Just the filename, no path prefix
            filename = f"{self.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Always save to data directory
        filepath = f"data/{filename}"
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        # Return just the filename, not the full path
        return filename