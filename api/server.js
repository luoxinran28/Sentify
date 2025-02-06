const express = require('express');
const cors = require('cors');
const { verifyAccessCode } = require('../server/src/controllers/authController');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS 配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || true
    : 'http://localhost:3010',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Access-Code']
}));

app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 验证路由
app.post('/auth/verify', verifyAccessCode);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: '未找到请求的资源',
    path: req.path,
    code: 404
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('API 错误:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  res.status(err.status || 500).json({
    error: '服务器错误',
    details: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试',
    code: err.status || 500
  });
});

module.exports = app; 