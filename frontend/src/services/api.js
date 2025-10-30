import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tools API
export const toolsAPI = {
  getAll: (params = {}) => api.get('/tools/', { params }),
  getById: (id) => api.get(`/tools/${id}`),
  create: (data) => api.post('/tools/', data),
  update: (id, data) => api.put(`/tools/${id}`, data),
  delete: (id) => api.delete(`/tools/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: (params = {}) => api.get('/categories/', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  getToolsByCategory: (id) => api.get(`/categories/${id}/tools`),
};

export default api;