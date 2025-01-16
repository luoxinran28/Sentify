import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5010/api';

// 加密函数
const encryptCode = (code) => {
  return CryptoJS.SHA256(code).toString();
};

export const verifyCode = async (code) => {
  try {
    const encryptedCode = encryptCode(code);
    const response = await axios.post(`${API_URL}/auth/verify`, { code: encryptedCode });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.details || error.message;
    throw new Error(errorMessage);
  }
};

export const analyzeComments = async (comments) => {
  try {
    const response = await axios.post(`${API_URL}/comments/analyze`, { comments });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.details || error.message;
    throw new Error(errorMessage);
  }
}; 