const { analyzeWithDeepSeek } = require('../services/deepseekService');

exports.analyzeComments = async (req, res) => {
  try {
    const { comments } = req.body;
    
    if (!comments || !comments.trim()) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    console.log('收到评论:', comments);
    const commentArray = comments.split('\n').filter(comment => comment.trim());
    
    try {
      const analysis = await analyzeWithDeepSeek(comments);
      console.log('DeepSeek 分析结果:', analysis);
      
      const results = {
        totalComments: commentArray.length,
        sentimentDistribution: {
          positive: analysis.sentiment === 'positive' ? 1 : 0,
          neutral: analysis.sentiment === 'neutral' ? 1 : 0,
          negative: analysis.sentiment === 'negative' ? 1 : 0
        },
        keywords: analysis.keywords || [],
        themes: analysis.themes || [],
        averageSentiment: analysis.score || 0,
        summary: analysis.summary || ''
      };

      res.json(results);
    } catch (analysisError) {
      console.error('DeepSeek 分析错误:', analysisError);
      throw analysisError;
    }
  } catch (error) {
    console.error('处理错误:', error);
    res.status(500).json({ 
      error: '分析过程中发生错误',
      details: error.message 
    });
  }
}; 