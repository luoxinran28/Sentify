const analysisService = require('../services/analysis/analysisService');
const articleService = require('../services/article/articleService');
const databaseService = require('../services/database/databaseService');
const scenarioService = require('../services/scenarioService');

exports.analyzeArticles = async (req, res) => {
  try {
    const { articles } = req.body;
    const { scenarioId } = req.params;
    const userId = req.user.id;
    
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: '文章内容不能为空' });
    }

    const validArticles = articles
      .map(a => typeof a === 'string' ? a : a.text)
      .filter(text => text && text.trim().length > 0);

    if (validArticles.length === 0) {
      return res.status(400).json({ error: '没有有效的文章内容' });
    }

    const analysisResult = await analysisService.analyzeArticles(validArticles, scenarioId, userId);
    
    const results = {
      totalArticles: validArticles.length,
      sentimentDistribution: analysisResult.overallSentiment,
      averageSentiment: (
        analysisResult.analyses.reduce((sum, curr) => sum + curr.score, 0) / 
        validArticles.length
      ).toFixed(2),
      themes: analysisResult.themes,
      individualResults: analysisResult.analyses
    };

    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      error: '分析过程中发生错误',
      details: error.message 
    });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    
    const result = await articleService.getArticlesByScenario(
      scenarioId,
      parseInt(page),
      parseInt(limit),
      userId
    );
    
    res.json(result);
  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.clearArticles = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const userId = req.user.id;
    
    // 验证场景是否存在且属于当前用户
    const scenario = await scenarioService.getScenarioById(scenarioId, userId);
    if (!scenario) {
      return res.status(404).json({ message: '场景不存在或无权访问' });
    }

    const result = await articleService.clearArticles(scenarioId, userId);
    
    res.json({
      success: true,
      message: `成功清空 ${result.deletedCount} 篇文章`,
      ...result
    });
  } catch (error) {
    console.error('清空文章错误:', error);
    res.status(500).json({ 
      message: error.message || '清空文章失败'
    });
  }
};

exports.getScenarioArticles = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    
    const data = await articleService.getArticlesByScenario(
      scenarioId,
      parseInt(page),
      parseInt(limit),
      userId
    );
    
    res.json(data);
  } catch (error) {
    console.error('获取场景文章失败:', error);
    res.status(500).json({ 
      error: '获取场景文章失败',
      details: error.message 
    });
  }
};

exports.deleteArticles = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { articleIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({ 
        error: '无效的文章ID列表',
        details: '请提供要删除的文章ID数组'
      });
    }

    await articleService.deleteArticles(scenarioId, articleIds, userId);
    
    res.json({ 
      success: true, 
      message: `成功删除 ${articleIds.length} 篇文章` 
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ 
      error: '删除文章失败',
      details: error.message 
    });
  }
}; 