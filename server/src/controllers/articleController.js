const analysisService = require('../services/analysis/analysisService');
const articleService = require('../services/article/articleService');
const databaseService = require('../services/database/databaseService');

exports.analyzeArticles = async (req, res) => {
  try {
    const { articles } = req.body;
    const { scenarioId } = req.params;
    
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: '文章内容不能为空' });
    }

    const validArticles = articles
      .map(a => typeof a === 'string' ? a : a.text)
      .filter(text => text && text.trim().length > 0);

    if (validArticles.length === 0) {
      return res.status(400).json({ error: '没有有效的文章内容' });
    }

    const analysisResult = await analysisService.analyzeArticles(validArticles, scenarioId);
    res.json(analysisResult);
  } catch (error) {
    console.error('分析文章失败:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { page = 1, limit = 5 } = req.query;
    
    const result = await articleService.getArticlesByScenario(
      scenarioId,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json(result);
  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.clearArticles = async (req, res) => {
  try {
    await databaseService.clearArticles();
    res.json({ success: true });
  } catch (error) {
    console.error('清除文章失败:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getScenarioArticles = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    
    // 获取场景的文章和分析结果
    const data = await analysisService.getScenarioArticles(scenarioId);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: '获取场景文章失败',
      details: error.message 
    });
  }
}; 