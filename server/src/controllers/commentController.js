const Sentiment = require('sentiment');
const sentiment = new Sentiment();

exports.analyzeComments = async (req, res) => {
  try {
    const { comments } = req.body;
    
    if (!comments || !comments.trim()) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const commentArray = comments.split('\n').filter(comment => comment.trim());
    
    const analysis = commentArray.map(comment => {
      const result = sentiment.analyze(comment);
      return {
        text: comment,
        sentiment: result.score,
        comparative: result.comparative
      };
    });

    const results = {
      totalComments: commentArray.length,
      sentimentDistribution: {
        positive: analysis.filter(a => a.sentiment > 0).length,
        neutral: analysis.filter(a => a.sentiment === 0).length,
        negative: analysis.filter(a => a.sentiment < 0).length
      },
      details: analysis
    };

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: '分析过程中发生错误' });
  }
}; 