const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const articleController = require('../controllers/articleControllerV2');

// 应用认证中间件
router.use(authenticateUser);

// 文章分析路由
router.get('/:scenarioId', articleController.getScenarioArticles);
router.post('/:scenarioId/analyze', articleController.analyzeArticles);
router.post('/:scenarioId/clear', articleController.clearArticles);
router.delete('/:scenarioId', articleController.deleteArticles);

// 清空指定场景下的所有文章
router.post(
  '/:scenarioId/clear',
  articleController.clearArticles.bind(articleController)
);

module.exports = router; 