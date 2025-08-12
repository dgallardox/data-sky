from flask import Flask, jsonify, request
from flask_cors import CORS
from scrapers.scraper_manager import ScraperManager
from scrapers.reddit_scraper import RedditScraper
from scrapers.twitter_scraper import TwitterScraper
from config.settings import settings
import os
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:8936", "http://127.0.0.1:8936"])

scraper_manager = ScraperManager()

os.makedirs('data', exist_ok=True)

# Load default config
default_config_path = 'config/scrapers.json'
if os.path.exists(default_config_path):
    with open(default_config_path, 'r') as f:
        default_configs = json.load(f)
        
    # Register Reddit scraper with config
    if 'reddit' in default_configs:
        reddit_scraper = RedditScraper(default_configs['reddit'])
        scraper_manager.register_scraper(reddit_scraper)
    
    # Register Twitter scraper with config
    if 'twitter' in default_configs:
        twitter_scraper = TwitterScraper(default_configs['twitter'])
        scraper_manager.register_scraper(twitter_scraper)


@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(scraper_manager.get_status())


@app.route('/api/server/start', methods=['POST'])
def start_server():
    success = scraper_manager.start_scheduler()
    return jsonify({
        "status": "started" if success else "already_running", 
        "is_running": scraper_manager.is_running
    })


@app.route('/api/server/stop', methods=['POST'])
def stop_server():
    scraper_manager.stop_scheduler()
    return jsonify({
        "status": "stopped", 
        "is_running": scraper_manager.is_running
    })


@app.route('/api/server/run-now', methods=['POST'])
def run_scrapers_now():
    results = scraper_manager.run_all_scrapers()
    return jsonify({"status": "completed", "results": results})


@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify(settings.to_dict())



@app.route('/api/scrapers', methods=['GET'])
def get_scrapers():
    return jsonify({
        "scrapers": scraper_manager.get_all_scrapers_info()
    })


@app.route('/api/scrapers/<scraper_name>/config', methods=['GET'])
def get_scraper_config(scraper_name):
    config = scraper_manager.get_scraper_config(scraper_name)
    if config:
        return jsonify(config)
    return jsonify({"error": "Scraper not found"}), 404


@app.route('/api/scrapers/<scraper_name>/config', methods=['POST'])
def update_scraper_config(scraper_name):
    data = request.get_json()
    scraper_manager.update_scraper_config(scraper_name, data)
    return jsonify({"status": "updated", "config": data})


@app.route('/api/scrapers/<scraper_name>/run', methods=['POST'])
def run_single_scraper(scraper_name):
    try:
        result = scraper_manager.run_single_scraper(scraper_name)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/scrapers/<scraper_name>/toggle', methods=['POST'])
def toggle_scraper(scraper_name):
    data = request.get_json()
    enabled = data.get('enabled', True)
    
    config = scraper_manager.get_scraper_config(scraper_name)
    if config:
        config['enabled'] = enabled
        scraper_manager.update_scraper_config(scraper_name, config)
        return jsonify({"status": "updated", "enabled": enabled})
    return jsonify({"error": "Scraper not found"}), 404


@app.route('/api/scrapers/<scraper_name>/stats', methods=['GET'])
def get_scraper_stats(scraper_name):
    stats = scraper_manager.get_scraper_stats(scraper_name)
    if stats:
        return jsonify(stats)
    return jsonify({"error": "Scraper not found"}), 404


@app.route('/api/results/<filename>', methods=['GET'])
def view_results(filename):
    """View scraped data as JSON"""
    filepath = f"data/{filename}"
    
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Failed to read file: {str(e)}"}), 500


@app.route('/api/results/<filename>/download', methods=['GET'])
def download_results(filename):
    """Download scraped data file"""
    from flask import send_file
    filepath = f"data/{filename}"
    
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(filepath, as_attachment=True, download_name=filename)


if __name__ == '__main__':
    app.run(host=settings.host, port=settings.port, debug=settings.debug)