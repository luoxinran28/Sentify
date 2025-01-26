const express = require('express');
const cors = require('cors');
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


module.exports = app; 