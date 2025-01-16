const { analyzeWithDeepSeek } = require('../services/deepseekService');

exports.analyzeComments = async (req, res) => {
  try {
    const { comments } = req.body;
    
    if (!Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    console.log('收到评论:', comments);
    
    try {
      // 分析每条评论
      const analysisPromises = comments.map(comment => analyzeWithDeepSeek(comment));
      const analysisResults = await Promise.all(analysisPromises);
      
      console.log('DeepSeek 分析结果:', analysisResults);
      
      // 计算整体情感分布
      const sentimentDistribution = analysisResults.reduce((acc, curr) => {
        acc[curr.sentiment]++;
        return acc;
      }, { positive: 0, neutral: 0, negative: 0 });

      // 汇总所有主题
      const themesMap = new Map();
      analysisResults.forEach(result => {
        result.themes.forEach(theme => {
          const existing = themesMap.get(theme.theme) || { count: 0, positive: 0, negative: 0, neutral: 0 };
          existing.count += theme.count;
          existing[theme.sentiment]++;
          themesMap.set(theme.theme, existing);
        });
      });

      const results = {
        totalComments: comments.length,
        sentimentDistribution,
        averageSentiment: (analysisResults.reduce((sum, curr) => sum + curr.score, 0) / comments.length).toFixed(2),
        themes: Array.from(themesMap.entries()).map(([theme, stats]) => ({
          theme,
          count: stats.count,
          sentiment: stats.positive > stats.negative ? 'positive' : 
                    stats.negative > stats.positive ? 'negative' : 'neutral'
        })),
        individualResults: analysisResults
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