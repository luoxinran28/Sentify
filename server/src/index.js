const express = require('express');
const cors = require('cors');
const path = require('path');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');
const db = require('./services/postgresService');
const scenarioRoutes = require('./routes/scenarioRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(express.json());

// 添加验证路由
app.use('/api/auth', authRoutes);
// 评论分析路由
app.use('/api/comments', commentRoutes);
app.use('/api/scenarios', scenarioRoutes);

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    // 验证环境变量
    if (!process.env.POSTGRES_URL) {
      throw new Error('数据库连接字符串未配置');
    }

    await db.initDatabase();
    console.log('数据库初始化成功');
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('无法连接到数据库，请检查数据库连接配置');
    }
    process.exit(1);
  }
};

// 处理未捕获的异常
process.on('unhandledRejection', (error) => {
  console.error('未处理的 Promise 拒绝:', error);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

startServer(); 

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    details: err.message
  });
}); 