const express = require('express');
const cors = require('cors');
const commentRoutes = require('./routes/commentRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(express.json());
app.use('/api/comments', commentRoutes);

const startServer = async () => {
  try {
    await app.listen(PORT);
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`端口 ${PORT} 已被占用，请先运行 npm run stop:server`);
      process.exit(1);
    }
    console.error('启动服务器时发生错误:', error);
    process.exit(1);
  }
};

startServer(); 