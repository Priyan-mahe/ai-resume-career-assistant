import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (import.meta.env?.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    const { port, hostname } = window.location;
    // When port is empty (production HTTPS/HTTP like Vercel) or 5173 (Vite proxy) or 5000 (Express local), use relative /api
    if (!port || port === '5173' || port === '5000') {
      return '/api';
    }
    // On Live Server (port 5500) or other static origins, route to Express server
    return `http://${hostname || 'localhost'}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const registerUserApi = (data) => API.post('/auth/register', data);
export const loginUserApi = (data) => API.post('/auth/login', data);
export const getMeApi = () => API.get('/auth/me');

// Resume Services
export const getResumesApi = () => API.get('/resumes');
export const getResumeByIdApi = (id) => API.get(`/resumes/${id}`);
export const createResumeApi = (data) => API.post('/resumes', data);
export const updateResumeApi = (id, data) => API.put(`/resumes/${id}`, data);
export const deleteResumeApi = (id) => API.delete(`/resumes/${id}`);
export const analyzeResumeAtsApi = (id, data) => API.post(`/resumes/${id}/ats`, data);
export const generateSummaryApi = (data) => API.post('/resumes/summary', data);
export const improveExperienceApi = (data) => API.post('/resumes/improve-experience', data);
export const uploadAndAnalyzeApi = (formData) =>
  API.post('/resumes/upload-analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Job Services
export const analyzeJobApi = (data) => API.post('/job/analyze', data);
export const matchJobApi = (data) => API.post('/job/match', data);

// Cover Letter Services
export const generateCoverLetterApi = (data) => API.post('/cover-letter/generate', data);
export const getCoverLettersApi = () => API.get('/cover-letter');

// Portfolio Services
export const getUserPortfolioApi = () => API.get('/portfolio/me/current');
export const createPortfolioApi = (data) => API.post('/portfolio', data);
export const getPublicPortfolioApi = (username) => API.get(`/portfolio/${username}`);

// Career Services
export const getCareerRecommendApi = (data) => API.post('/career/recommend', data);
export const sendCareerChatApi = (data) => API.post('/career/chat', data);
export const getCareerRoadmapApi = (data) => API.post('/career/roadmap', data);

// Interview Services
export const getInterviewQuestionsApi = (data) => API.post('/interview/questions', data);
export const evaluateInterviewAnswerApi = (data) => API.post('/interview/evaluate', data);

export default API;
