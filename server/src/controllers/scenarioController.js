const scenarioService = require('../services/scenarioService');

// 获取场景列表
exports.getScenarios = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await scenarioService.getScenarios(
      parseInt(page),
      parseInt(limit)
    );
    res.json(result);
  } catch (error) {
    console.error('获取场景列表失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 创建新场景
exports.createScenario = async (req, res) => {
  try {
    const userId = req.user.id;
    const scenario = await scenarioService.createScenario(userId, req.body);
    res.status(201).json(scenario);
  } catch (error) {
    console.error('创建场景失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 获取场景详情
exports.getScenarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const scenario = await scenarioService.getScenarioById(id, userId);
    
    if (!scenario) {
      return res.status(404).json({ message: '场景不存在' });
    }
    
    res.json(scenario);
  } catch (error) {
    console.error('获取场景详情失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 更新场景
exports.updateScenario = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = { ...req.body, userId };
    
    const scenario = await scenarioService.updateScenario(id, data);
    res.json(scenario);
  } catch (error) {
    console.error('更新场景失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 删除场景
exports.deleteScenario = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await scenarioService.deleteScenario(id, userId);
    res.json({ message: '场景删除成功' });
  } catch (error) {
    console.error('删除场景失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 获取场景的情感类型
exports.getScenarioSentiments = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const userId = req.user.id;
    
    const sentiments = await scenarioService.getScenarioSentiments(scenarioId, userId);
    res.json(sentiments);
  } catch (error) {
    console.error('获取场景情感类型失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 添加情感类型到场景
exports.addSentimentToScenario = async (req, res) => {
  try {
    const { scenarioId, sentimentId } = req.params;
    const userId = req.user.id;
    
    const result = await scenarioService.addSentimentToScenario(scenarioId, sentimentId, userId);
    res.json(result);
  } catch (error) {
    console.error('添加情感类型到场景失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 从场景中移除情感类型
exports.removeSentimentFromScenario = async (req, res) => {
  try {
    const { scenarioId, sentimentId } = req.params;
    const userId = req.user.id;
    
    const result = await scenarioService.removeSentimentFromScenario(scenarioId, sentimentId, userId);
    res.json(result);
  } catch (error) {
    console.error('从场景中移除情感类型失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 获取所有可用的情感类型
exports.getAllSentiments = async (req, res) => {
  try {
    const sentiments = await scenarioService.getAllSentiments();
    res.json(sentiments);
  } catch (error) {
    console.error('获取所有情感类型失败:', error);
    res.status(500).json({ message: error.message });
  }
};

// 创建新的情感类型
exports.createSentiment = async (req, res) => {
  try {
    const sentiment = await scenarioService.createSentiment(req.body);
    res.status(201).json(sentiment);
  } catch (error) {
    console.error('创建情感类型失败:', error);
    res.status(500).json({ message: error.message });
  }
};
