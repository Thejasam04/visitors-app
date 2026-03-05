import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Auto attach token to every request
api.interceptors.request.use((config) => {
const token = localStorage.getItem('adminToken') || localStorage.getItem('token');  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const sendOTP   = (email) => api.post('/api/auth/send-otp', { email });
export const verifyOTP = (email, otp) => api.post('/api/auth/verify-otp', { email, otp });

// Visitor APIs
export const getHosts      = () => api.get('/api/hosts');
export const submitVisit   = (data) => api.post('/api/visitors', data);
export const getMyVisits   = () => api.get('/api/visitors/my');
export const getStats      = () => api.get('/api/visitors/stats');

// Admin APIs
export const adminLogin    = (email, password) => api.post('/api/admin/login', { email, password });
export const getDashboard  = () => api.get('/api/admin/dashboard');
export const getAllVisitors = (params) => api.get('/api/admin/visitors', { params });
export const getAdminHosts = () => api.get('/api/admin/hosts');
export const addHost       = (data) => api.post('/api/admin/hosts', data);
export const updateHost    = (id, data) => api.put(`/api/admin/hosts/${id}`, data);
export const deleteHost    = (id) => api.delete(`/api/admin/hosts/${id}`);
export const getReports    = () => api.get('/api/admin/reports');

export default api;