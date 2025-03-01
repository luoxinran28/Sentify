const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const articleController = require('../controllers/articleControllerV2');
const scenarioController = require('../controllers/scenarioController');

// 应用认证中间件到所有场景相关路由
router.use(authenticateUser);

// 场景管理路由
router.get('/', scenarioController.getScenarios);
router.post('/', scenarioController.createScenario);

// 情感类型管理路由 - 放在参数路由之前
router.get('/sentiments', scenarioController.getAllSentiments);
router.post('/sentiments', scenarioController.createSentiment);

// 场景详情路由 - 参数路由放在具体路径之后
router.get('/:id', scenarioController.getScenarioById);
router.put('/:id', scenarioController.updateScenario);
router.delete('/:id', scenarioController.deleteScenario);

// 场景文章路由
router.get('/:scenarioId/articles', articleController.listArticles);

// 场景情感类型关联路由
router.get('/:scenarioId/sentiments', scenarioController.getScenarioSentiments);
router.post('/:scenarioId/sentiments/:sentimentId', scenarioController.addSentimentToScenario);
router.delete('/:scenarioId/sentiments/:sentimentId', scenarioController.removeSentimentFromScenario);

module.exports = router; 