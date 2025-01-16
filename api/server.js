const express = require('express');
const cors = require('cors');
const { analyzeComments } = require('../server/src/controllers/commentController');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

const app = express();

app.use(cors());
app.use(express.json());

// 添加错误处理中间件
app.use((err, req, res, next) => {
  console.error('API 错误:', err);
  res.status(500).json({
    error: '服务器错误',
    details: err.message
  });
});

// 这个路由会被转换为 Serverless 函数
// 实际访问路径: https://sentify-love.vercel.app/api/comments/analyze
app.post('/api/comments/analyze', analyzeComments);

// Vercel 需要这个导出来创建 Serverless 函数
module.exports = app; 