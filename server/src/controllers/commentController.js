const commentAnalysisService = require('../services/commentAnalysisService');

exports.analyzeComments = async (req, res) => {
  try {
    const { comments } = req.body;
    
    if (!Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const validComments = comments
      .map(c => typeof c === 'string' ? c : c.text)
      .filter(text => text && text.trim().length > 0);

    if (validComments.length === 0) {
      return res.status(400).json({ error: '没有有效的评论内容' });
    }

    const analysisResult = await commentAnalysisService.analyzeComments(validComments);
    
    const results = {
      totalComments: validComments.length,
      sentimentDistribution: analysisResult.overallSentiment,
      averageSentiment: (
        analysisResult.analyses.reduce((sum, curr) => sum + curr.score, 0) / 
        validComments.length
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