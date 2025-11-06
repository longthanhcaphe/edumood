import axios from 'axios';

// Use environment variable for API URL, fallback to relative path for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Student APIs
export const submitEmotion = async (emotion, message) => {
  const response = await axios.post(`${API_BASE_URL}/emotions`, { emotion, message });
  return response.data;
};

export const getStudentEmotions = async (studentId) => {
  const response = await axios.get(`${API_BASE_URL}/emotions/student/${studentId}`);
  return response.data;
};

// Teacher APIs
export const getStudentsByClass = async (classId) => {
  const response = await axios.get(`${API_BASE_URL}/students/class/${classId}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await axios.post(`${API_BASE_URL}/students`, studentData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await axios.put(`${API_BASE_URL}/students/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/students/${id}`);
  return response.data;
};

export const getEmotionsByClass = async (classId, startDate, endDate) => {
  let url = `${API_BASE_URL}/emotions/class/${classId}`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await axios.get(url);
  return response.data;
};

export const getClassAnalytics = async (classId, startDate, endDate) => {
  let url = `${API_BASE_URL}/analytics/class/${classId}`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await axios.get(url);
  return response.data;
};

export const getAIAnalysis = async (classId, startDate, endDate) => {
  const response = await axios.post(`${API_BASE_URL}/analytics/ai`, {
    classId,
    startDate,
    endDate
  });
  return response.data;
};

export const checkTodaySubmission = async (studentId) => {
  const response = await axios.get(`${API_BASE_URL}/emotions/check/${studentId}`);
  return response.data;
};

// Admin APIs
export const getAllTeachers = async () => {
  const response = await axios.get(`${API_BASE_URL}/teachers`);
  return response.data;
};

export const createTeacher = async (teacherData) => {
  const response = await axios.post(`${API_BASE_URL}/teachers`, teacherData);
  return response.data;
};

export const updateTeacher = async (id, teacherData) => {
  const response = await axios.put(`${API_BASE_URL}/teachers/${id}`, teacherData);
  return response.data;
};

export const deleteTeacher = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/teachers/${id}`);
  return response.data;
};

export const getAllClasses = async () => {
  const response = await axios.get(`${API_BASE_URL}/classes`);
  return response.data;
};

export const createClass = async (classData) => {
  const response = await axios.post(`${API_BASE_URL}/classes`, classData);
  return response.data;
};

export const updateClass = async (id, classData) => {
  const response = await axios.put(`${API_BASE_URL}/classes/${id}`, classData);
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/classes/${id}`);
  return response.data;
};

export const assignTeacher = async (classId, teacherId) => {
  const response = await axios.put(`${API_BASE_URL}/classes/${classId}/assign-teacher`, { teacherId });
  return response.data;
};

// Reward APIs
export const getAllRewards = async () => {
  const response = await axios.get(`${API_BASE_URL}/rewards`);
  return response.data;
};

export const createReward = async (rewardData) => {
  const response = await axios.post(`${API_BASE_URL}/rewards`, rewardData);
  return response.data;
};

export const updateReward = async (id, rewardData) => {
  const response = await axios.put(`${API_BASE_URL}/rewards/${id}`, rewardData);
  return response.data;
};

export const deleteReward = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/rewards/${id}`);
  return response.data;
};

export const redeemReward = async (rewardId) => {
  const response = await axios.post(`${API_BASE_URL}/rewards/redeem`, { rewardId });
  return response.data;
};

export const getStudentRedemptions = async (studentId) => {
  const response = await axios.get(`${API_BASE_URL}/rewards/redemptions/student/${studentId}`);
  return response.data;
};

export const getPendingRedemptions = async () => {
  const response = await axios.get(`${API_BASE_URL}/rewards/redemptions/pending`);
  return response.data;
};

export const updateRedemptionStatus = async (id, status) => {
  const response = await axios.put(`${API_BASE_URL}/rewards/redemptions/${id}`, { status });
  return response.data;
};

export const getGlobalAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/global`);
  return response.data;
};
