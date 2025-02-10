const deepseekService = require('../deepseekService');
const crypto = require('crypto');

// 模拟数据，用于测试
const mockAnalysisData = 
  {
    sentiment: 'emotional',
    translatedSentiment: '感性',
    confidence: 0.8,
    confidenceDistribution: {
      hasty: 0.1,
      emotional: 0.8,
      functional: 0.3
    },
    translation: '这款手机壳看起来不错，但存在重大缺陷。尽管有三个信用卡卡位，但你只能放两张卡——放更多会导致外壳鼓起，必须用力按压顶部的磁铁才能扣上。我现在只放驾照和一张信用卡，还算可以。买家必须注意这个缺陷，否则它确实好看。如果你能接受只放两张卡就买，否则请跳过。',
    highlights: {
      hasty: [],
      emotional: ["good looking"],
      functional: ["three place holders", "ONLY keep 2 cards", "bulge", "press hard", "magnet", "buyers must be aware", "skip"]
    },
    translatedHighlights: {
      hasty: [],
      emotional: ["好看"],
      functional: ["三个卡位", "只能放两张卡", "鼓起", "用力按压", "磁铁", "买家必须注意", "跳过"]
    },
    reasoning: '评论详细描述了手机壳卡槽的实际使用问题（如‘只能放两张卡’‘鼓起’‘按压磁铁’），提供了具体的使用建议（‘买家必须注意’‘如果能接受就买’），功能描述清晰且具指导性。尽管提到‘好看’，但重点在客观缺陷和建议，情绪词汇较少。',
    brief: '用户指出手机壳卡槽设计缺陷，建议仅存放两张卡并警示潜在买家。'
  };

class AnalysisService {
  async analyzeArticles(articles, scenarioId, userId) {
    try {
      // 模拟验证用户权限
      await this._validateUserAccess(scenarioId, userId);

      // 检查缓存（使用模拟数据）
      const cachedResults = await this._getCachedResults(articles);

      // 如果所有文章都有缓存，直接返回
      if (cachedResults.every(result => result !== null)) {
        return {
          analyses: cachedResults,
          overallSentiment: this._calculateOverallSentiment(cachedResults),
          resultsAttributes: {
            sentimentTranslation: {
              hasty: "敷衍",
              emotional: "感性",
              functional: "实用"
            }
          }
        };
      }

      // // 获取未缓存的文章
      // const uncachedArticles = articles.filter((_, index) => !cachedResults[index]);
      
      // // // 调用 API 分析未缓存的文章
      // const apiResult = await deepseekService.analyze(uncachedArticles, scenarioId, userId);

      // // // 合并缓存和新分析的结果
      // const finalResults = this._mergeCachedAndNewResults(articles, cachedResults, apiResult.analyses);

      return {
        analyses: cachedResults,
        overallSentiment: this._calculateOverallSentiment(cachedResults),
        resultsAttributes: apiResult.resultsAttributes
      };
    } catch (error) {
      console.error('文章分析错误:', error);
      throw new Error(`分析失败: ${error.message}`);
    }
  }

  async _validateUserAccess(scenarioId, userId) {
    // 模拟权限验证
    if (!scenarioId || !userId) {
      throw new Error('无权访问该场景或场景不存在');
    }
    return true;
  }

  async _getCachedResults(articles) {
    // 模拟从缓存获取结果
    let i = 0;
    return Promise.all(
      articles.map(async (article) => {
        try {
          const contentHash = this._generateContentHash(article);
          mockAnalysisData['id']=i++;
          return mockAnalysisData || null;
        } catch (error) {
          console.error('获取缓存结果错误:', error);
          return null;
        }
      })
    );
  }

  _generateContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  _calculateOverallSentiment(analyses) {
    const distribution = {
      hasty: 0,
      emotional: 0,
      functional: 0
    };

    analyses.forEach(analysis => {
      if (analysis && analysis.sentiment) {
        distribution[analysis.sentiment]++;
      }
    });

    return distribution;
  }

  _mergeCachedAndNewResults(articles, cachedResults, newResults) {
    let newResultIndex = 0;
    return articles.map((_, index) => {
      return cachedResults[index] || newResults[newResultIndex++];
    });
  }

  // 获取场景的所有文章及其分析结果
  async getScenarioArticles(scenarioId, userId) {
    try {
      await this._validateUserAccess(scenarioId, userId);

      // 模拟从数据库获取文章
      const mockArticles = [
        {
          id: 'mock-article-1',
          content: '这是一个示例文章内容',
          ...mockAnalysisData['mock-hash-1']
        }
      ];

      if (mockArticles.length === 0) {
        return { articles: [], results: null };
      }

      const analysisResults = {
        totalArticles: mockArticles.length,
        sentimentDistribution: this._calculateOverallSentiment(mockArticles),
        individualResults: mockArticles.map(article => ({
          sentiment: article.sentiment,
          translatedSentiment: article.translatedSentiment,
          confidence: article.confidence,
          translation: article.translation,
          highlights: article.highlights,
          translatedHighlights: article.translatedHighlights,
          confidenceDistribution: article.confidenceDistribution,
          reasoning: article.reasoning,
          brief: article.brief
        }))
      };

      return {
        articles: mockArticles.map(article => ({
          id: article.id,
          content: article.content
        })),
        results: analysisResults
      };
    } catch (error) {
      console.error('获取场景文章错误:', error);
      throw error;
    }
  }
}

module.exports = new AnalysisService(); 