const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const articleController = require('../controllers/articleController');

// 应用认证中间件
router.use(authenticateUser);

// 文章分析路由
router.post('/analyze', articleController.analyzeArticles);
router.post('/clear', articleController.clearArticles);

module.exports = router; 