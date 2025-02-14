const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const articleController = require('../controllers/articleControllerV2');
const scenarioController = require('../controllers/scenarioController');

// 应用认证中间件到所有场景相关路由
router.use(authenticateUser);

// 场景相关路由
router.get('/', scenarioController.getScenarios);
router.post('/', scenarioController.createScenario);
router.put('/:id', scenarioController.updateScenario);
router.delete('/:id', scenarioController.deleteScenario);

// 场景文章路由
router.get('/:scenarioId/articles', articleController.getArticles);

module.exports = router; 