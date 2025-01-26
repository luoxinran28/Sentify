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
  const accessCode = localStorage.getItem('accessCode');
  if (accessCode) {
    config.headers['X-Access-Code'] = accessCode;
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
      localStorage.setItem('accessCode', encryptedCode);
    }
    
    return data;
  } catch (error) {
    throw new Error('验证失败，请稍后重试');
  }
};

// 添加一个函数来获取存储的验证码
const addAccessCodeHeader = (headers = {}) => {
  const encryptedCode = localStorage.getItem('accessCode');
  if (encryptedCode) {
    headers['X-Access-Code'] = encryptedCode;
  }
  return headers;
};

// 场景相关 API
export const scenarioApi = {
  getScenarios: (page = 1, signal) => fetch(`${API_URL}/scenarios?page=${page}`, {
    headers: addAccessCodeHeader({
      'Content-Type': 'application/json'
    }),
    signal
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

// 文章分析相关 API
export const analyzeArticles = async (articles, scenarioId) => {
  try {
    const response = await fetch(`${API_URL}/articles/${scenarioId}/analyze`, {
      method: 'POST',
      headers: addAccessCodeHeader({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ articles })
    });
    return response.json();
  } catch (error) {
    const errorMessage = error.response?.data?.details || error.message;
    throw new Error(errorMessage);
  }
};

export const clearArticles = async (scenarioId) => {
  try {
    const response = await fetch(`${API_URL}/articles/${scenarioId}/clear`, {
      method: 'POST',
      headers: addAccessCodeHeader({
        'Content-Type': 'application/json'
      })
    });
    return response.json();
  } catch (error) {
    const errorMessage = error.response?.data?.details || error.message;
    throw new Error(errorMessage);
  }
};

export const getScenarioArticles = async (scenarioId) => {
  try {
    const response = await fetch(`${API_URL}/articles/${scenarioId}`, {
      headers: addAccessCodeHeader()
    });
    return response.json();
  } catch (error) {
    const errorMessage = error.response?.data?.details || error.message;
    throw new Error(errorMessage);
  }
}; 