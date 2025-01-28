const { query } = require('../database/query');
const databaseService = require('../database/databaseService');

class AnalysisService {
  async analyzeArticles(articles, scenarioId) {
    try {
      // 检查缓存的分析结果
      const cachedResults = await Promise.all(
        articles.map(article => databaseService.findAnalysisByContent(article))
      );

      // 过滤出需要新分析的文章
      const newArticles = articles.filter((_, index) => !cachedResults[index]);
      
      // 如果所有文章都有缓存结果，直接返回
      if (newArticles.length === 0) {
        return this._processResults(cachedResults.filter(r => r));
      }

      // 分析新文章
      const results = await Promise.all(
        newArticles.map(async (article) => {
          // 这里保持原有的分析逻辑
          const result = {
            sentiment: 'neutral',
            score: '0.5',
            translation: article,
            highlights: { positive: [], negative: [] },
            translatedHighlights: { positive: [], negative: [] },
            keywords: []
          };

          // 保存分析结果到数据库
          await databaseService.saveAnalysis(article, result, scenarioId);
          return result;
        })
      );

      // 合并缓存和新分析的结果
      const allResults = [
        ...cachedResults.filter(r => r),
        ...results
      ];

      return this._processResults(allResults);
    } catch (error) {
      console.error('分析文章错误:', error);
      throw error;
    }
  }

  _processResults(results) {
    // 统计情感分布
    const sentimentCounts = results.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {});

    // 提取主题（示例实现）
    const themes = [...new Set(results.flatMap(r => r.keywords || []))];

    return {
      totalArticles: results.length,
      sentimentDistribution: {
        positive: sentimentCounts.positive || 0,
        negative: sentimentCounts.negative || 0,
        neutral: sentimentCounts.neutral || 0
      },
      averageSentiment: (
        results.reduce((sum, curr) => sum + parseFloat(curr.score), 0) / results.length
      ).toFixed(2),
      themes,
      individualResults: results
    };
  }
}

module.exports = new AnalysisService(); 