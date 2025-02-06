const express = require('express');
const cors = require('cors');
const authRoutes = require('../server/src/routes/authRoutes');
const path = require('path');
require('dotenv').config();

// 全局未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', {
    error: error.message,
    stack: error.stack
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', {
    reason: reason?.message || reason,
    stack: reason?.stack
  });
});

const app = express();

// 请求体大小限制
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS 配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || true
    : 'http://localhost:3010',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Access-Code']
}));

// 请求日志中间件
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // 响应完成时的日志
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });

  next();
});

// API 路由
app.use('/auth', authRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
  const errorDetails = {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    headers: {
      ...req.headers,
      'x-access-code': req.headers['x-access-code'] ? '***' : undefined
    },
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  };

  console.error('API 错误:', errorDetails);

  res.status(err.status || 500).json({
    error: '服务器错误',
    details: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试',
    code: err.status || 500
  });
});

module.exports = app; 