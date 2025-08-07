from flask import Flask, jsonify, request
from flask_cors import CORS
from scrapers.scraper_manager import ScraperManager
from config.settings import settings
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

scraper_manager = ScraperManager()

os.makedirs('data', exist_ok=True)


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


@app.route('/api/settings/port', methods=['POST'])
def update_port():
    data = request.get_json()
    new_port = data.get('port')
    
    if not new_port or not isinstance(new_port, int) or new_port < 1024 or new_port > 65535:
        return jsonify({"error": "Invalid port number"}), 400
    
    settings.update_port(new_port)
    return jsonify({"status": "updated", "port": new_port})


@app.route('/api/scrapers', methods=['GET'])
def get_scrapers():
    return jsonify({
        "scrapers": [{"name": s.name, "last_scraped": s.last_scraped} for s in scraper_manager.scrapers]
    })


if __name__ == '__main__':
    app.run(host=settings.host, port=settings.port, debug=settings.debug)