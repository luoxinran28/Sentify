const scenarioService = require('../services/scenarioService');

exports.getScenarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const scenarios = await scenarioService.getScenarios(page);
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createScenario = async (req, res) => {
  try {
    const scenario = await scenarioService.createScenario(req.user.id, req.body);
    res.json(scenario);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateScenario = async (req, res) => {
  try {
    const scenario = await scenarioService.updateScenario(req.params.id, req.body);
    res.json(scenario);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteScenario = async (req, res) => {
  try {
    await scenarioService.deleteScenario(req.params.id);
    res.json({
      success: true,
      message: '场景删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ... 其他控制器方法保持不变 ... 