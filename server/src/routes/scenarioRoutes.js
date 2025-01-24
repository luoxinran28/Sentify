const express = require('express');
const router = express.Router();
const { 
  getScenarios, 
  createScenario, 
  updateScenario, 
  deleteScenario,
  getScenario
} = require('../controllers/scenarioController');
const { authenticateUser } = require('../middleware/authMiddleware');

// 所有场景路由都需要认证
router.use(authenticateUser);

router.get('/', getScenarios);
router.post('/', createScenario);
router.get('/:id', getScenario);
router.put('/:id', updateScenario);
router.delete('/:id', deleteScenario);

module.exports = router; 