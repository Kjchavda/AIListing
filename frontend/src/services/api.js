import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  // This tells React: "Use the Vercel cloud URL if it exists, otherwise use localhost"
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
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

export const bookmarksAPI = {
  getAll: (params = {}) => api.get('/bookmarks/', { params }),
  create: (data) => api.post('/bookmarks/', data),
  delete: (id) => api.delete(`/bookmarks/${id}`),
  check: (params) => api.get('/bookmarks/check', { params }),
  // Toggle convenience endpoint
  toggleTool: (toolId) => api.post(`/tools/${toolId}/bookmark`),
};

// Likes API
export const likesAPI = {
  getAll: (params = {}) => api.get('/likes/', { params }),
  create: (data) => api.post('/likes/', data),
  delete: (id) => api.delete(`/likes/${id}`),
  check: (params) => api.get('/likes/check', { params }),
  toggleTool: (toolId) => api.post(`/tools/${toolId}/like`),
};


export default api;