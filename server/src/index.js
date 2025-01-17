const express = require('express');
const cors = require('cors');
const path = require('path');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');
const { initDatabase } = require('./services/initDatabaseService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(express.json());

// 添加验证路由
app.use('/api/auth', authRoutes);
// 评论分析路由
app.use('/api/comments', commentRoutes);

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    await initDatabase();
    console.log('数据库初始化成功');
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer(); 