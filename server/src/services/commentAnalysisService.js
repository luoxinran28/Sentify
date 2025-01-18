const deepseekService = require('./deepseekService');
const db = require('./postgresService');

class CommentAnalysisService {
  async analyzeComments(comments) {
    try {
      // 检查缓存
      const cachedResults = await this._getCachedResults(comments);

      // 如果所有评论都有缓存，直接返回
      if (cachedResults.every(result => result !== null)) {
        return {
          analyses: cachedResults,
          themes: this._generateThemesFromCache(cachedResults),
          overallSentiment: this._calculateOverallSentiment(cachedResults)
        };
      }

      // 获取未缓存的评论
      const uncachedComments = comments.filter((_, index) => !cachedResults[index]);
      
      // 调用 DeepSeek API 分析未缓存的评论
      const apiResult = await deepseekService.analyze(uncachedComments);

      // 保存新的分析结果到数据库
      await this._saveAnalysisResults(uncachedComments, apiResult.analyses);

      // 合并缓存和新分析的结果
      const finalResults = this._mergeCachedAndNewResults(comments, cachedResults, apiResult.analyses);

      return {
        analyses: finalResults,
        themes: apiResult.themes,
        overallSentiment: this._calculateOverallSentiment(finalResults)
      };

    } catch (error) {
      console.error('评论分析错误:', error);
      throw new Error(`评论分析失败: ${error.message}`);
    }
  }

  async _getCachedResults(comments) {
    return Promise.all(
      comments.map(async (comment) => {
        try {
          const cached = await db.findAnalysisByContent(comment);
          if (cached) {
            return {
              sentiment: cached.sentiment,
              score: cached.score,
              translation: cached.translation,
              highlights: cached.highlights,
              translatedHighlights: cached.translated_highlights,
              keywords: cached.keywords,
              summary: cached.summary
            };
          }
          return null;
        } catch (error) {
          console.error('缓存结果解析错误:', error);
          return null;
        }
      })
    );
  }

  // 安全的 JSON 解析函数
  _safeParseJSON(jsonString, defaultValue = null) {
    try {
      // 如果已经是对象，直接返回
      if (typeof jsonString === 'object' && jsonString !== null) {
        return jsonString;
      }
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON 解析错误:', error);
      return defaultValue;
    }
  }

  async _saveAnalysisResults(comments, analyses) {
    return Promise.all(
      comments.map((comment, index) => 
        db.saveAnalysis(comment, analyses[index])
      )
    );
  }

  _mergeCachedAndNewResults(comments, cachedResults, newResults) {
    const cachedCount = cachedResults.filter(r => r !== null).length;
    return comments.map((_, index) => 
      cachedResults[index] || newResults[index - cachedCount]
    );
  }

  _calculateOverallSentiment(analyses) {
    return {
      positive: analyses.filter(r => r.sentiment === 'positive').length,
      negative: analyses.filter(r => r.sentiment === 'negative').length,
      neutral: analyses.filter(r => r.sentiment === 'neutral').length
    };
  }

  _generateThemesFromCache(analyses) {
    // TODO: 实现从缓存结果生成主题分析
    // 这里可以根据关键词频率等信息生成主题
    return [];
  }
}

module.exports = new CommentAnalysisService(); 