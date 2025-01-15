const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// 关键词提取
exports.extractKeywords = (comments) => {
  const tfidf = new TfIdf();
  
  // 添加所有评论到 TF-IDF
  comments.forEach(comment => tfidf.addDocument(comment));
  
  // 获取关键词
  const keywords = new Map();
  
  comments.forEach((_, docIndex) => {
    tfidf.listTerms(docIndex).slice(0, 5).forEach(item => {
      const { term, tfidf: score } = item;
      if (term.length > 1) { // 忽略单字符词
        keywords.set(term, (keywords.get(term) || 0) + score);
      }
    });
  });
  
  // 返回前10个关键词
  return Array.from(keywords.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term, score]) => ({ term, score }));
};

// 主题分析
exports.analyzeThemes = (comments) => {
  const themes = new Map();
  
  comments.forEach(comment => {
    const tokens = tokenizer.tokenize(comment.toLowerCase());
    
    // 简单的主题规则
    if (tokens.some(t => ['价格', '贵', '便宜', '实惠'].includes(t))) {
      themes.set('价格', (themes.get('价格') || 0) + 1);
    }
    if (tokens.some(t => ['质量', '好用', '耐用', '差'].includes(t))) {
      themes.set('质量', (themes.get('质量') || 0) + 1);
    }
    if (tokens.some(t => ['服务', '态度', '客服', '售后'].includes(t))) {
      themes.set('服务', (themes.get('服务') || 0) + 1);
    }
  });
  
  return Array.from(themes.entries())
    .map(([theme, count]) => ({
      theme,
      count,
      percentage: (count / comments.length * 100).toFixed(1)
    }));
};

// 计算平均情感得分
exports.calculateAverageSentiment = (analysis) => {
  const sum = analysis.reduce((acc, curr) => acc + curr.sentiment, 0);
  return (sum / analysis.length).toFixed(2);
}; 