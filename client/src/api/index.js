import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register  = (data)  => api.post('/auth/register', data);
export const login     = (data)  => api.post('/auth/login', data);
export const getMe     = ()      => api.get('/auth/me');

// Skills
export const getMySkills   = ()      => api.get('/skills/mine');
export const getAllSkills   = ()      => api.get('/skills');
export const addSkill       = (data) => api.post('/skills', data);
export const verifySkill    = (id)   => api.put(`/skills/${id}/verify`);
export const deleteSkill    = (id)   => api.delete(`/skills/${id}`);

// Requests
export const createRequest   = (data) => api.post('/requests', data);
export const getMyRequests   = ()     => api.get('/requests/my');
export const getTeachingReqs = ()     => api.get('/requests/teaching');
export const offerTeach      = (id)   => api.post(`/requests/${id}/offer`);
export const selectTeacher   = (id, teacherId) => api.post(`/requests/${id}/select`, { teacherId });

// Chats
export const getChats      = ()      => api.get('/chats');
export const getChat       = (id)    => api.get(`/chats/${id}`);
export const sendMessage   = (id, content) => api.post(`/chats/${id}/message`, { content });

// Progress
export const getProgress   = ()      => api.get('/progress');

// AI (Teach Devta / Groq)
export const askDevtaAI       = (data) => api.post('/ai/ask', data);
export const generateDevtaQuiz = (data) => api.post('/ai/generate-quiz', data);

export default api;

