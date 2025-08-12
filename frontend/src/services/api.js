import axios from 'axios';

const API_BASE_URL = 'http://localhost:8937/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const serverAPI = {
  getStatus: () => api.get('/status'),
  startServer: () => api.post('/server/start'),
  stopServer: () => api.post('/server/stop'),
  runNow: () => api.post('/server/run-now'),
  getSettings: () => api.get('/settings'),
  updatePort: (port) => api.post('/settings/port', { port }),
  getScrapers: () => api.get('/scrapers'),
  
  // Scraper-specific endpoints
  getScraperConfig: (name) => api.get(`/scrapers/${name}/config`),
  updateScraperConfig: (name, config) => api.post(`/scrapers/${name}/config`, config),
  runScraper: (name) => api.post(`/scrapers/${name}/run`),
  toggleScraper: (name, enabled) => api.post(`/scrapers/${name}/toggle`, { enabled }),
  getScraperStats: (name) => api.get(`/scrapers/${name}/stats`),
};

export default api;