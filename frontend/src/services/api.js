import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

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
};

export default api;