const articleAnalysisService = require('../services/articleAnalysisService');

exports.analyzeArticles = async (req, res) => {
  try {
    const { articles } = req.body;
    const { scenarioId } = req.params;  // 从URL参数获取scenarioId
    
    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: '文章内容不能为空' });
    }

    const validArticles = articles
      .map(a => typeof a === 'string' ? a : a.text)
      .filter(text => text && text.trim().length > 0);

    if (validArticles.length === 0) {
      return res.status(400).json({ error: '没有有效的文章内容' });
    }

    const analysisResult = await articleAnalysisService.analyzeArticles(validArticles, scenarioId);
    
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

exports.clearArticles = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    await articleAnalysisService.clearArticles(scenarioId);
    res.json({ success: true, message: '数据已清空' });
  } catch (error) {
    res.status(500).json({ 
      error: '清空数据失败',
      details: error.message 
    });
  }
}; 