const express = require('express');
const cors = require('cors');
const { analyzeComments, clearComments } = require('../server/src/controllers/commentController');
const { verifyAccessCode } = require('../server/src/controllers/authController');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

const app = express();

app.use(cors());
app.use(express.json());

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('API 错误:', err);
  res.status(err.status || 500).json({
    error: '服务器错误',
    details: err.message,
    code: err.status || 500
  });
});

// 添加验证路由
app.post('/api/auth/verify', verifyAccessCode);

// 评论分析路由
app.post('/api/comments/analyze', async (req, res, next) => {
  try {
    const result = await analyzeComments(req, res);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// 清空评论路由
app.post('/api/comments/clear', async (req, res, next) => {
  try {
    const result = await clearComments(req, res);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = app; 