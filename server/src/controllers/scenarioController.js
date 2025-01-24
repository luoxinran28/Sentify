const scenarioService = require('../services/scenarioService');

exports.getScenarios = async (req, res) => {
  try {
    const scenarios = await scenarioService.getScenarios(req.user.id);
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ 
      error: '获取场景列表失败',
      details: error.message 
    });
  }
};

exports.createScenario = async (req, res) => {
  try {
    const { titleEn, titleZh, source, prompt } = req.body;
    
    // 验证必填字段
    if (!titleEn || !titleZh || !prompt) {
      return res.status(400).json({ 
        error: '缺少必要字段',
        details: '英文标题、中文标题和prompt为必填项'
      });
    }

    const scenario = await scenarioService.createScenario(
      req.user.id,
      { titleEn, titleZh, source, prompt }
    );
    
    res.status(201).json(scenario);
  } catch (error) {
    const status = error.message.includes('场景数量上限') ? 400 : 500;
    res.status(status).json({ 
      error: '创建场景失败',
      details: error.message 
    });
  }
};

exports.updateScenario = async (req, res) => {
  try {
    const { titleEn, titleZh, source, prompt } = req.body;
    const { id } = req.params;

    if (!titleEn || !titleZh || !prompt) {
      return res.status(400).json({ 
        error: '缺少必要字段',
        details: '英文标题、中文标题和prompt为必填项'
      });
    }

    const scenario = await scenarioService.updateScenario(
      req.user.id,
      id,
      { titleEn, titleZh, source, prompt }
    );
    
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ 
      error: '更新场景失败',
      details: error.message 
    });
  }
};

exports.deleteScenario = async (req, res) => {
  try {
    const { id } = req.params;
    await scenarioService.deleteScenario(req.user.id, id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      error: '删除场景失败',
      details: error.message 
    });
  }
};

exports.getScenario = async (req, res) => {
  try {
    const { id } = req.params;
    const scenario = await scenarioService.getScenarioById(req.user.id, id);
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ 
      error: '获取场景详情失败',
      details: error.message 
    });
  }
}; 