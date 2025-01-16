const { analyzeWithDeepSeek } = require('../services/deepseekService');

exports.analyzeComments = async (req, res) => {
  try {
    const { comments } = req.body;
    
    if (!Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    try {
      // 一次性分析所有评论
      const analysisResult = await analyzeWithDeepSeek(comments);
      
      const results = {
        totalComments: comments.length,
        sentimentDistribution: analysisResult.overallSentiment,
        averageSentiment: (
          analysisResult.analyses.reduce((sum, curr) => sum + curr.score, 0) / 
          comments.length
        ).toFixed(2),
        themes: analysisResult.themes,
        individualResults: analysisResult.analyses
      };

      res.json(results);
    } catch (analysisError) {
      throw analysisError;
    }
  } catch (error) {
    res.status(500).json({ 
      error: '分析过程中发生错误',
      details: error.message 
    });
  }
}; 