import json
import requests
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional
from sentence_transformers import SentenceTransformer
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_similarity
import os

class AIAnalyzer:
    def __init__(self, embedding_model='nomic-ai/nomic-embed-text-v1.5'):
        """Initialize the AI analyzer with embedding model"""
        self.embedding_model_name = embedding_model
        self.embedding_model = None
        self.ollama_base_url = 'http://localhost:11434'
        
    def _load_embedding_model(self):
        """Lazy load the embedding model to avoid startup delays"""
        if self.embedding_model is None:
            try:
                self.embedding_model = SentenceTransformer(
                    self.embedding_model_name, 
                    trust_remote_code=True
                )
                print(f"✅ Loaded embedding model: {self.embedding_model_name}")
            except Exception as e:
                print(f"Warning: Could not load embedding model {self.embedding_model_name}: {e}")
                self.embedding_model = None
        return self.embedding_model is not None

    def extract_text_content(self, batch_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract all text from different sources into uniform format"""
        texts = []
        
        # Check if this is a batch file (has by_source) or individual scraper file
        if 'by_source' in batch_data:
            # Handle batch file structure
            by_source = batch_data['by_source']
            
            # Extract Reddit content from batch
            if 'reddit' in by_source:
                reddit_data = by_source['reddit']
                for post in reddit_data.get('data', []):
                    # Combine title and selftext
                    full_text = post.get('title', '')
                    if post.get('selftext'):
                        full_text += f" {post['selftext']}"
                    
                    if full_text.strip():
                        texts.append({
                            'text': full_text.strip(),
                            'source': 'reddit',
                            'metadata': {
                                'subreddit': post.get('subreddit', ''),
                                'score': post.get('score', 0),
                                'num_comments': post.get('num_comments', 0),
                                'url': post.get('url', '')
                            }
                        })

            # Extract Twitter content from batch
            if 'twitter' in by_source:
                twitter_data = by_source['twitter']
                for tweet in twitter_data.get('data', []):
                    text = tweet.get('text', '').strip()
                    if text:
                        texts.append({
                            'text': text,
                            'source': 'twitter',
                            'metadata': {
                                'likes': tweet.get('public_metrics', {}).get('like_count', 0),
                                'retweets': tweet.get('public_metrics', {}).get('retweet_count', 0),
                                'replies': tweet.get('public_metrics', {}).get('reply_count', 0)
                            }
                        })
        
        else:
            # Handle individual scraper file structure
            source = batch_data.get('source', 'unknown')
            
            if source == 'reddit':
                # Reddit individual files use 'data' array
                data = batch_data.get('data', [])
                for post in data:
                    # Combine title and selftext
                    full_text = post.get('title', '')
                    if post.get('selftext'):
                        full_text += f" {post['selftext']}"
                    
                    if full_text.strip():
                        texts.append({
                            'text': full_text.strip(),
                            'source': 'reddit',
                            'metadata': {
                                'subreddit': post.get('subreddit', ''),
                                'score': post.get('score', 0),
                                'num_comments': post.get('num_comments', 0),
                                'url': post.get('url', '')
                            }
                        })
            
            elif source == 'twitter':
                # Twitter individual files use 'tweets' array
                tweets = batch_data.get('tweets', [])
                for tweet in tweets:
                    text = tweet.get('text', '').strip()
                    if text:
                        texts.append({
                            'text': text,
                            'source': 'twitter',
                            'metadata': {
                                'likes': tweet.get('public_metrics', {}).get('like_count', 0),
                                'retweets': tweet.get('public_metrics', {}).get('retweet_count', 0),
                                'replies': tweet.get('public_metrics', {}).get('reply_count', 0)
                            }
                        })

        return texts

    def cluster_similar_content(self, texts: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Group similar content using embeddings + DBSCAN clustering"""
        if not texts:
            return {}
            
        if not self._load_embedding_model():
            # Fallback: no clustering, treat each as its own cluster
            return {f"item_{i}": [text] for i, text in enumerate(texts)}

        try:
            # Extract text for embedding
            text_only = [t['text'] for t in texts]
            
            # Generate embeddings
            embeddings = self.embedding_model.encode(text_only, show_progress_bar=False)
            
            # DBSCAN clustering with cosine distance
            # eps=0.4 works well for text similarity, min_samples=2 for meaningful clusters
            clustering = DBSCAN(eps=0.4, min_samples=2, metric='cosine')
            labels = clustering.fit_predict(embeddings)
            
            # Group texts by cluster
            clusters = {}
            for idx, label in enumerate(labels):
                if label == -1:  # Noise/outliers
                    cluster_key = f"unique_{idx}"
                else:
                    cluster_key = f"cluster_{label}"
                    
                if cluster_key not in clusters:
                    clusters[cluster_key] = []
                clusters[cluster_key].append(texts[idx])
            
            return clusters
            
        except Exception as e:
            print(f"Clustering failed: {e}")
            # Fallback: no clustering
            return {f"item_{i}": [text] for i, text in enumerate(texts)}

    def summarize_clusters(self, clusters: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """Extract key themes from each cluster"""
        summaries = []
        
        for cluster_id, items in clusters.items():
            if cluster_id.startswith('unique_'):
                continue  # Skip single-item outliers for main analysis
                
            # Calculate engagement score for sorting
            def get_engagement_score(item):
                metadata = item['metadata']
                if item['source'] == 'reddit':
                    return metadata.get('score', 0) + metadata.get('num_comments', 0)
                elif item['source'] == 'twitter':
                    return metadata.get('likes', 0) + metadata.get('retweets', 0) * 2
                return 0
            
            # Sort by engagement
            sorted_items = sorted(items, key=get_engagement_score, reverse=True)
            
            # Get representative texts (top 3 most engaging)
            representative_texts = []
            for item in sorted_items[:3]:
                # Truncate very long texts
                text = item['text']
                if len(text) > 200:
                    text = text[:200] + "..."
                representative_texts.append(text)
            
            summaries.append({
                'cluster_id': cluster_id,
                'cluster_size': len(items),
                'representative_texts': representative_texts,
                'sources': list(set(item['source'] for item in items)),
                'total_engagement': sum(get_engagement_score(item) for item in items)
            })
        
        # Sort by cluster size (bigger clusters = more common patterns)
        return sorted(summaries, key=lambda x: x['cluster_size'], reverse=True)

    def analyze_with_ollama(self, cluster_summaries: List[Dict[str, Any]], model_name: str = 'qwen2.5:14b') -> Dict[str, Any]:
        """Send clustered data to Ollama for insight extraction"""
        
        if not cluster_summaries:
            return {
                "opportunities": [],
                "trends": [],
                "pain_points": []
            }
        
        # Build structured prompt
        prompt = """You are analyzing clustered social media discussions to identify product opportunities.

IMPORTANT: Respond with valid JSON only, no explanation text.

Clusters of similar discussions (ordered by frequency):
"""
        
        # Include top 8 clusters to avoid overwhelming the model
        for idx, summary in enumerate(cluster_summaries[:8]):
            prompt += f"\nCLUSTER {idx+1} ({summary['cluster_size']} similar posts from {', '.join(summary['sources'])}):\n"
            for text in summary['representative_texts']:
                prompt += f"- {text}\n"
        
        prompt += """
Analyze these patterns and return JSON:
{
  "opportunities": [
    {
      "title": "Clear product opportunity description",
      "confidence": 0.85,
      "evidence": "Specific evidence from the clusters",
      "cluster_refs": [1, 2],
      "sources": ["reddit", "twitter"]
    }
  ],
  "trends": [
    {
      "topic": "Trending topic name",
      "momentum": "rising",
      "mentions": 15
    }
  ],
  "pain_points": [
    {
      "issue": "User frustration or problem",
      "frequency": "high"
    }
  ]
}

Focus on actionable opportunities and clear trends. Confidence should reflect how strong the evidence is."""

        try:
            # Call Ollama API
            response = requests.post(f'{self.ollama_base_url}/api/generate', 
                json={
                    'model': model_name,
                    'prompt': prompt,
                    'stream': False,
                    'temperature': 0.3,  # Lower temperature for consistent JSON
                    'format': 'json'  # Use Ollama's JSON mode
                },
                timeout=120  # 2 minute timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis = json.loads(result['response'])
                return analysis
            else:
                raise Exception(f"Ollama API error: {response.status_code}")
                
        except json.JSONDecodeError as e:
            print(f"Failed to parse Ollama JSON response: {e}")
            return {"opportunities": [], "trends": [], "pain_points": [], "error": "Invalid JSON response"}
        except Exception as e:
            print(f"Ollama analysis failed: {e}")
            return {"opportunities": [], "trends": [], "pain_points": [], "error": str(e)}

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available Ollama models suitable for analysis"""
        try:
            response = requests.get(f'{self.ollama_base_url}/api/tags', timeout=10)
            if response.status_code == 200:
                models = response.json().get('models', [])
                
                # Filter for models suitable for analysis (>2B parameters typically)
                suitable_models = []
                for model in models:
                    name = model['name']
                    size = model.get('size', 0)
                    
                    # Skip embedding models and very small models
                    if 'embed' in name.lower() or 'mini' in name.lower():
                        continue
                        
                    # Add size category
                    if size > 8 * 1024 * 1024 * 1024:  # >8GB
                        category = 'large'
                    elif size > 4 * 1024 * 1024 * 1024:  # >4GB
                        category = 'medium'
                    else:
                        category = 'small'
                    
                    suitable_models.append({
                        'name': name,
                        'size': size,
                        'size_gb': round(size / (1024**3), 1),
                        'category': category,
                        'modified': model.get('modified_at', '')
                    })
                
                return sorted(suitable_models, key=lambda x: x['size'], reverse=True)
            else:
                return []
        except Exception as e:
            print(f"Failed to get Ollama models: {e}")
            return []

    def analyze_batch_file(self, filename: str, model_name: str = 'qwen2.5:14b') -> Dict[str, Any]:
        """Complete analysis pipeline for a batch file"""
        try:
            # Load batch file
            filepath = f"data/{filename}"
            if not os.path.exists(filepath):
                raise Exception(f"File not found: {filename}")
            
            with open(filepath, 'r', encoding='utf-8') as f:
                batch_data = json.load(f)
            
            # Run analysis pipeline
            texts = self.extract_text_content(batch_data)
            if not texts:
                raise Exception("No text content found in batch file")
                
            clusters = self.cluster_similar_content(texts)
            summaries = self.summarize_clusters(clusters)
            insights = self.analyze_with_ollama(summaries, model_name)
            
            # Create analysis result
            analysis_result = {
                'source_file': filename,
                'analyzed_at': datetime.now().isoformat(),
                'model': model_name,
                'stats': {
                    'total_items': len(texts),
                    'clusters_found': len(clusters),
                    'meaningful_clusters': len(summaries),
                    'sources': list(set(item['source'] for item in texts))
                },
                'insights': insights
            }
            
            # Save analysis to file
            analysis_filename = filename.replace('.json', '_analysis.json')
            analysis_filepath = f"data/{analysis_filename}"
            
            with open(analysis_filepath, 'w', encoding='utf-8') as f:
                json.dump(analysis_result, f, indent=2, ensure_ascii=False)
            
            return {
                'success': True,
                'analysis': insights,
                'stats': analysis_result['stats'],
                'filename': analysis_filename
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'analysis': {"opportunities": [], "trends": [], "pain_points": []}
            }