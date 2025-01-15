import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5010/api';

export const analyzeComments = async (comments) => {
  try {
    const response = await axios.post(`${API_URL}/comments/analyze`, { comments });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.details || error.message;
    throw new Error(errorMessage);
  }
}; 