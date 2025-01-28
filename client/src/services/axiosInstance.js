import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5010/api';

// 加密函数
export const encryptCode = (code) => {
  return CryptoJS.SHA256(code).toString();
};

// 添加请求头的辅助函数
export const addAccessCodeHeader = (headers = {}) => {
  const accessCode = localStorage.getItem('accessCode');
  if (accessCode) {
    headers['X-Access-Code'] = accessCode;
  }
  return headers;
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = addAccessCodeHeader(config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessCode');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 