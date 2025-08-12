import requests
import time
from typing import Dict, List, Any
from datetime import datetime, timedelta
from scrapers.base_scraper import BaseScraper


class TwitterScraper(BaseScraper):
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__('twitter')
        
        # Default configuration
        default_config = {
            'bearer_token': '',
            'search_queries': [
                'I wish there was an app',
                'looking for a tool that',
                'does anyone know how to'
            ],
            'time_window': '24h',  # 1h, 24h, 3d, 7d
            'max_results_per_query': 10,
            'exclude_retweets': True,
            'enabled': True
        }
        
        self.config = {**default_config, **(config or {})}
        self.base_url = 'https://api.twitter.com/2/tweets/search/recent'
        
    def get_config(self) -> Dict[str, Any]:
        """Get current configuration"""
        return self.config.copy()
    
    def update_config(self, config: Dict[str, Any]):
        """Update configuration"""
        self.config.update(config)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get scraper statistics for dashboard"""
        return {
            'name': 'twitter',
            'display_name': 'Twitter/X',
            'icon': 'twitter',
            'enabled': self.config.get('enabled', True),
            'search_queries_count': len(self.config.get('search_queries', [])),
            'max_results_per_query': self.config.get('max_results_per_query', 10),
            'time_window': self.config.get('time_window', '24h'),
            'has_token': bool(self.config.get('bearer_token', '')),
            'last_run': None  # Could track this if needed
        }
    
    def _get_time_range(self) -> str:
        """Convert time window to Twitter API format (ISO 8601)"""
        now = datetime.utcnow()
        time_map = {
            '1h': timedelta(hours=1),
            '24h': timedelta(days=1),
            '3d': timedelta(days=3),
            '7d': timedelta(days=7)
        }
        
        delta = time_map.get(self.config['time_window'], timedelta(days=1))
        start_time = now - delta
        return start_time.strftime('%Y-%m-%dT%H:%M:%SZ')
    
    def scrape(self) -> List[Dict[str, Any]]:
        """Scrape tweets based on search queries"""
        if not self.config.get('enabled'):
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Twitter scraper is disabled")
            return []
        
        if not self.config.get('bearer_token'):
            raise ValueError("Twitter bearer token is required")
        
        headers = {
            'Authorization': f"Bearer {self.config['bearer_token']}",
            'User-Agent': 'DataSky/1.0'
        }
        
        all_tweets = []
        start_time = self._get_time_range()
        
        for query in self.config['search_queries']:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Searching Twitter for: {query}")
            
            # Build query with retweet filter
            full_query = query
            if self.config.get('exclude_retweets', True):
                full_query += ' -is:retweet'
            
            # Add language filter (English only as discussed)
            full_query += ' lang:en'
            
            params = {
                'query': full_query,
                'start_time': start_time,
                'max_results': min(self.config.get('max_results_per_query', 10), 100),
                'tweet.fields': 'created_at,author_id,public_metrics,conversation_id'
            }
            
            try:
                response = requests.get(
                    self.base_url,
                    headers=headers,
                    params=params,
                    timeout=30
                )
                
                if response.status_code == 429:
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Rate limit reached")
                    break
                
                response.raise_for_status()
                data = response.json()
                
                if 'data' in data:
                    tweets = data['data']
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Found {len(tweets)} tweets for query: {query}")
                    
                    # Add query context to each tweet
                    for tweet in tweets:
                        tweet['search_query'] = query
                    
                    all_tweets.extend(tweets)
                else:
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] No tweets found for query: {query}")
                
                # Rate limiting - Twitter allows 300 requests per 15 min for app auth
                # Being conservative with free tier
                time.sleep(2)
                
            except requests.exceptions.RequestException as e:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Error searching Twitter: {str(e)}")
                continue
        
        return all_tweets
    
    def validate_data(self, data: List[Dict[str, Any]]) -> bool:
        """Validate scraped Twitter data"""
        if not data:
            return False
        
        # Check if we have at least some tweets
        if not isinstance(data, list) or len(data) == 0:
            return False
        
        # Validate first tweet has required fields
        if data[0]:
            required_fields = ['id', 'text']
            return all(field in data[0] for field in required_fields)
        
        return False
    
    def filter_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter tweets based on engagement metrics"""
        filtered = []
        
        for tweet in data:
            # Skip if no public metrics
            if 'public_metrics' not in tweet:
                filtered.append(tweet)
                continue
            
            metrics = tweet['public_metrics']
            
            # Could add filtering based on engagement here
            # For now, include all tweets but sort by engagement
            engagement_score = (
                metrics.get('retweet_count', 0) * 2 +
                metrics.get('like_count', 0) +
                metrics.get('reply_count', 0) * 3  # Replies indicate discussion
            )
            tweet['engagement_score'] = engagement_score
            filtered.append(tweet)
        
        # Sort by engagement score
        filtered.sort(key=lambda x: x.get('engagement_score', 0), reverse=True)
        
        return filtered
    
    def convert_to_common_format(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Convert to common format for storage"""
        return {
            "source": "twitter",
            "scraped_at": datetime.now().isoformat(),
            "time_window": self.config['time_window'],
            "search_queries": self.config['search_queries'],
            "total_tweets": len(data),
            "tweets": data
        }