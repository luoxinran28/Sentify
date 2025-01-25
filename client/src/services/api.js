import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5010/api';

const api = axios.create({
  baseURL: API_URL
});

// 加密函数
const encryptCode = (code) => {
  return CryptoJS.SHA256(code).toString();
};

// 添加请求拦截器
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id) {
    config.headers['X-User-ID'] = user.id;
  }
  return config;
});

export const verifyCode = async (code) => {
  try {
    const encryptedCode = encryptCode(code);
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: encryptedCode })
    });

    const data = await response.json();
    
    if (data.success) {
      // 保存加密后的验证码用于后续请求
      localStorage.setItem('accessCode', encryptedCode);
    }
    
    return data;
  } catch (error) {
    throw new Error('验证失败，请稍后重试');
  }
};

// 添加一个函数来获取存储的验证码
export const getStoredAccessCode = () => {
  return localStorage.getItem('accessCode');
};

// 修改其他 API 请求，使用加密后的验证码
const addAccessCodeHeader = (headers = {}) => {
  const encryptedCode = localStorage.getItem('accessCode');
  if (encryptedCode) {
    headers['X-Access-Code'] = encryptedCode;
  }
  return headers;
};

// 在其他 API 请求中使用
export const someApiCall = async () => {
  const response = await fetch('/api/some-endpoint', {
    headers: addAccessCodeHeader({
      'Content-Type': 'application/json'
    })
  });
  // ... 处理响应
};

export const analyzeComments = async (comments) => {
  try {
    const response = await api.post('/comments/analyze', { comments });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.details || error.message;
    throw new Error(errorMessage);
  }
};

export const clearComments = async () => {
  try {
    const response = await api.post('/comments/clear');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.details || error.message;
    throw new Error(errorMessage);
  }
};

// 场景相关 API
export const scenarioApi = {
  getScenarios: (page = 1) => fetch(`${API_URL}/scenarios?page=${page}`, {
    headers: addAccessCodeHeader({
      'Content-Type': 'application/json'
    })
  }).then(res => res.json()),
  
  createScenario: (data) => fetch(`${API_URL}/scenarios`, {
    method: 'POST',
    headers: addAccessCodeHeader({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  updateScenario: (id, data) => fetch(`${API_URL}/scenarios/${id}`, {
    method: 'PUT',
    headers: addAccessCodeHeader({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  deleteScenario: (id) => fetch(`${API_URL}/scenarios/${id}`, {
    method: 'DELETE',
    headers: addAccessCodeHeader({
      'Content-Type': 'application/json'
    })
  }).then(res => res.json())
}; 