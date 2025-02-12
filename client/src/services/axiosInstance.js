import axios from 'axios';
import CryptoJS from 'crypto-js';

// 根据环境确定 API URL，不需要添加 /api 前缀，因为所有路由都已包含
const API_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? ''  // 在生产环境中使用相对路径，因为所有路由都已包含 /api
    : 'http://localhost:5010'
);

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
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加访问码到请求头
    config.headers = addAccessCodeHeader(config.headers);
    
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
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
    // 添加更详细的错误日志
    console.error('API 错误:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    return Promise.reject(error);
  }
);

export default axiosInstance; 