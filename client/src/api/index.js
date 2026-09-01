import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register         = (data)         => api.post('/auth/register', data);
export const login            = (data)         => api.post('/auth/login', data);
export const getMe            = ()             => api.get('/auth/me');
export const forgotPassword   = (data)         => api.post('/auth/forgot-password', data);
export const verifyResetToken = (token)        => api.get(`/auth/verify-reset-token/${encodeURIComponent(token)}`);
export const resetPassword    = (token, data)  => api.post(`/auth/reset-password/${encodeURIComponent(token)}`, data);

// Skills
export const getMySkills   = ()      => api.get('/skills/mine');
export const getAllSkills   = ()      => api.get('/skills');
export const addSkill       = (data) => api.post('/skills', data);
export const verifySkill    = (id)   => api.put(`/skills/${id}/verify`);
export const deleteSkill    = (id)   => api.delete(`/skills/${id}`);

// Requests
export const createRequest    = (data)             => api.post('/requests', data);
export const getMyRequests    = ()                 => api.get('/requests/my');
export const getTeachingReqs  = ()                 => api.get('/requests/teaching');
export const getRequestsBySkill = (skill)          => api.get(`/requests/by-skill/${encodeURIComponent(skill)}`);
export const offerTeach       = (id)               => api.post(`/requests/${id}/offer`);
export const selectTeacher    = (id, teacherId)    => api.post(`/requests/${id}/select`, { teacherId });
export const clearAllRequests = ()                 => api.delete('/requests/clear-all');

// Chats
export const getChats      = ()               => api.get('/chats');
export const getChat       = (id)             => api.get(`/chats/${id}`);
export const sendMessage   = (id, content)    => api.post(`/chats/${id}/message`, { content });
export const completeChat  = (id)             => api.patch(`/chats/${id}/complete`);

// Progress
export const getProgress   = () => api.get('/progress');

// AI (Teach Devta)
export const askDevtaAI        = (data) => api.post('/ai/ask', data);
export const generateDevtaQuiz = (data) => api.post('/ai/generate-quiz', data);
export const enhanceRequest    = (data) => api.post('/ai/enhance-request', data);

export default api;
