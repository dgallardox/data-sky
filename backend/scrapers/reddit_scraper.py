import requests
import time
from typing import Dict, List, Any
from datetime import datetime
from scrapers.base_scraper import BaseScraper


class RedditScraper(BaseScraper):
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__('reddit')
        self.base_url = 'https://www.reddit.com/r/{}/hot.json'
        self.headers = {
            'User-Agent': 'DataSky/1.0 (Web Scraper for Data Analysis)'
        }
        
        default_config = {
            'subreddits': ['python', 'programming', 'technology'],
            'posts_per_subreddit': 25,
            'sort_by': 'hot',
            'enabled': True
        }
        
        self.config = {**default_config, **(config or {})}
        
    def scrape(self) -> List[Dict[str, Any]]:
        all_posts = []
        
        for subreddit in self.config['subreddits']:
            try:
                posts = self._scrape_subreddit(subreddit)
                all_posts.extend(posts)
                time.sleep(1)  # Rate limiting: 1 request per second
            except Exception as e:
                print(f"Error scraping r/{subreddit}: {e}")
                continue
        
        self.last_scraped = datetime.now()
        return all_posts
    
    def _scrape_subreddit(self, subreddit: str) -> List[Dict[str, Any]]:
        sort_by = self.config.get('sort_by', 'hot')
        limit = self.config.get('posts_per_subreddit', 25)
        
        url = f'https://www.reddit.com/r/{subreddit}/{sort_by}.json'
        params = {'limit': limit}
        
        response = requests.get(url, headers=self.headers, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        posts = []
        
        for item in data.get('data', {}).get('children', []):
            post_data = item.get('data', {})
            
            post = {
                'id': post_data.get('id'),
                'subreddit': post_data.get('subreddit'),
                'title': post_data.get('title'),
                'author': post_data.get('author'),
                'score': post_data.get('score', 0),
                'upvote_ratio': post_data.get('upvote_ratio', 0),
                'num_comments': post_data.get('num_comments', 0),
                'created_utc': post_data.get('created_utc'),
                'url': post_data.get('url'),
                'permalink': f"https://reddit.com{post_data.get('permalink', '')}",
                'is_video': post_data.get('is_video', False),
                'scraped_at': datetime.now().isoformat()
            }
            
            posts.append(post)
        
        return posts
    
    def validate_data(self, data: List[Dict[str, Any]]) -> bool:
        if not data:
            return False
        
        required_fields = ['id', 'title', 'subreddit', 'author', 'score']
        
        for post in data:
            for field in required_fields:
                if field not in post or post[field] is None:
                    return False
        
        return True
    
    def get_config(self) -> Dict[str, Any]:
        return self.config
    
    def update_config(self, new_config: Dict[str, Any]) -> None:
        self.config.update(new_config)
    
    def get_stats(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'display_name': 'Reddit',
            'icon': 'reddit',
            'enabled': self.config.get('enabled', True),
            'config': self.config,
            'last_run': self.last_scraped.isoformat() if self.last_scraped else None,
            'subreddits_count': len(self.config.get('subreddits', [])),
            'posts_per_subreddit': self.config.get('posts_per_subreddit', 25)
        }