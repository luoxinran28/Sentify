import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5010/api';

export const analyzeComments = async (comments) => {
  try {
    const response = await axios.post(`${API_URL}/comments/analyze`, { comments });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || '分析请求失败');
  }
}; 