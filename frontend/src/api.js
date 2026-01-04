import axios from 'axios';

// Tworzymy instancję połączenia
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Adres FastAPI
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;