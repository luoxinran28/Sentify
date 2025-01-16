const express = require('express');
const cors = require('cors');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(express.json());

// 添加验证路由
app.use('/api/auth', authRoutes);
// 评论分析路由
app.use('/api/comments', commentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 