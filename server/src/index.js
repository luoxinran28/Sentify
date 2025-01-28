const express = require('express');
const cors = require('cors');
const scenarioRoutes = require('./routes/scenarioRoutes');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const { query } = require('./services/database/query');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(express.json());

// 添加验证路由
app.use('/api/auth', authRoutes);
// 场景路由
app.use('/api/scenarios', scenarioRoutes);
// 文章分析路由
app.use('/api/articles', articleRoutes);

// 初始化数据库并启动服务器
const startServer = async () => {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('数据库连接字符串未配置');
    }

    // 测试数据库连接
    await query('SELECT NOW()');
    console.log('数据库连接测试成功');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
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