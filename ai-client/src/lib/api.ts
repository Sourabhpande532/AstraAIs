import axios from 'axios';

// In production, VITE_API_URL = your backend Render/Railway URL
// In development, it's empty so Vite's proxy handles /api/* calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export default api;
