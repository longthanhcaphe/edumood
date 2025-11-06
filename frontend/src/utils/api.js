import axios from 'axios';

// Use environment variable for API URL, fallback to relative path for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Student APIs
export const submitEmotion = async (emotion, message) => {
  const response = await axiosInstance.post('/emotions', { emotion, message });
  return response.data;
};

export const getStudentEmotions = async (studentId) => {
  const response = await axiosInstance.get(`/emotions/student/${studentId}`);
  return response.data;
};

// Teacher APIs
export const getStudentsByClass = async (classId) => {
  const response = await axiosInstance.get(`/students/class/${classId}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await axiosInstance.post('/students', studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await axiosInstance.put(`/students/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await axiosInstance.delete(`/students/${id}`);
  return response.data;
};

export const getEmotionsByClass = async (classId, startDate, endDate) => {
  let url = `/emotions/class/${classId}`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getClassAnalytics = async (classId, startDate, endDate) => {
  let url = `/analytics/class/${classId}`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await axiosInstance.get(url);
  return response.data;
};

export const getAIAnalysis = async (classId, startDate, endDate) => {
  const response = await axiosInstance.post('/analytics/ai', {
    classId,
    startDate,
    endDate
  });
  return response.data;
};

export const checkTodaySubmission = async (studentId) => {
  const response = await axiosInstance.get(`/emotions/check/${studentId}`);
  return response.data;
};

// Admin APIs
export const getAllTeachers = async () => {
  const response = await axiosInstance.get('/teachers');
  return response.data;
};

export const createTeacher = async (teacherData) => {
  const response = await axiosInstance.post('/teachers', teacherData);
  return response.data;
};

export const updateTeacher = async (id, teacherData) => {
  const response = await axiosInstance.put(`/teachers/${id}`, teacherData);
  return response.data;
};

export const deleteTeacher = async (id) => {
  const response = await axiosInstance.delete(`/teachers/${id}`);
  return response.data;
};

export const getAllClasses = async () => {
  const response = await axiosInstance.get('/classes');
  return response.data;
};

export const createClass = async (classData) => {
  const response = await axiosInstance.post('/classes', classData);
  return response.data;
};

export const updateClass = async (id, classData) => {
  const response = await axiosInstance.put(`/classes/${id}`, classData);
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await axiosInstance.delete(`/classes/${id}`);
  return response.data;
};

export const assignTeacher = async (classId, teacherId) => {
  const response = await axiosInstance.put(`/classes/${classId}/assign-teacher`, { teacherId });
  return response.data;
};

// Reward APIs
export const getAllRewards = async () => {
  const response = await axiosInstance.get('/rewards');
  return response.data;
};

export const createReward = async (rewardData) => {
  const response = await axiosInstance.post('/rewards', rewardData);
  return response.data;
};

export const updateReward = async (id, rewardData) => {
  const response = await axiosInstance.put(`/rewards/${id}`, rewardData);
  return response.data;
};

export const deleteReward = async (id) => {
  const response = await axiosInstance.delete(`/rewards/${id}`);
  return response.data;
};

export const redeemReward = async (rewardId) => {
  const response = await axiosInstance.post('/rewards/redeem', { rewardId });
  return response.data;
};

export const getStudentRedemptions = async (studentId) => {
  const response = await axiosInstance.get(`/rewards/redemptions/student/${studentId}`);
  return response.data;
};

export const getPendingRedemptions = async () => {
  const response = await axiosInstance.get('/rewards/redemptions/pending');
  return response.data;
};

export const updateRedemptionStatus = async (id, status) => {
  const response = await axiosInstance.put(`/rewards/redemptions/${id}`, { status });
  return response.data;
};

export const getGlobalAnalytics = async () => {
  const response = await axiosInstance.get('/analytics/global');
  return response.data;
};

// Auth APIs
export const changePassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.put('/auth/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

// Export axiosInstance for use in AuthContext
export { axiosInstance };
