const { query } = require('../database/query');
const deepseekService = require('../deepseekService');
const crypto = require('crypto');

class AnalysisService {
  async analyzeArticles(articles, scenarioId) {
    try {
      // 检查缓存
      const cachedResults = await this._getCachedResults(articles, scenarioId);

      // 如果所有文章都有缓存，直接返回
      if (cachedResults.every(result => result !== null)) {
        return {
          analyses: cachedResults,
          themes: this._generateThemesFromCache(cachedResults),
          overallSentiment: this._calculateOverallSentiment(cachedResults)
        };
      }

      // 获取未缓存的文章
      const uncachedArticles = articles.filter((_, index) => !cachedResults[index]);
      
      // 调用 API 分析未缓存的文章
      const apiResult = await deepseekService.analyze(uncachedArticles);

      // 保存新的分析结果到数据库
      await this._saveAnalysisResults(uncachedArticles, apiResult.analyses, scenarioId);

      // 合并缓存和新分析的结果
      const finalResults = this._mergeCachedAndNewResults(articles, cachedResults, apiResult.analyses);

      return {
        analyses: finalResults,
        themes: apiResult.themes,
        overallSentiment: this._calculateOverallSentiment(finalResults)
      };
    } catch (error) {
      console.error('文章分析错误:', error);
      throw new Error(`分析失败: ${error.message}`);
    }
  }

  async _getCachedResults(articles, scenarioId) {
    return Promise.all(
      articles.map(async (article) => {
        try {
          const contentHash = this._generateContentHash(article);
          const result = await query(
            `SELECT 
              ar.sentiment,
              ar.score,
              ar.translation,
              ar.highlights,
              ar.translated_highlights as "translatedHighlights"
             FROM analysis_results ar
             JOIN articles a ON ar.article_id = a.id
             WHERE a.content_hash = $1 
             AND a.scenario_id = $2
             AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
             ORDER BY ar.created_at DESC
             LIMIT 1`,
            [contentHash, scenarioId]
          );
          return result.rows[0] || null;
        } catch (error) {
          console.error('获取缓存结果错误:', error);
          return null;
        }
      })
    );
  }

  async _saveAnalysisResults(articles, results, scenarioId) {
    try {
      await query('BEGIN');
      for (let i = 0; i < articles.length; i++) {
        const contentHash = this._generateContentHash(articles[i]);
        const articleResult = await query(
          `INSERT INTO articles (scenario_id, content, content_hash) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [scenarioId, articles[i], contentHash]
        );

        const articleId = articleResult.rows[0].id;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await query(
          `INSERT INTO analysis_results 
           (article_id, scenario_id, sentiment, score, translation, 
            highlights, translated_highlights, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            articleId,
            scenarioId,
            results[i].sentiment,
            results[i].score,
            results[i].translation,
            JSON.stringify(results[i].highlights),
            JSON.stringify(results[i].translatedHighlights),
            expiresAt
          ]
        );
      }
      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      console.error('保存分析结果错误:', error);
      throw error;
    }
  }

  _generateContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  _generateThemesFromCache(results) {
    const themes = new Map();
    results.forEach(result => {
      if (result.themes) {
        result.themes.forEach(theme => {
          if (themes.has(theme.name)) {
            themes.get(theme.name).count += 1;
          } else {
            themes.set(theme.name, { ...theme, count: 1 });
          }
        });
      }
    });
    return Array.from(themes.values());
  }

  _calculateOverallSentiment(results) {
    const distribution = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    results.forEach(result => {
      distribution[result.sentiment]++;
    });

    return distribution;
  }

  _mergeCachedAndNewResults(articles, cachedResults, newResults) {
    let newResultIndex = 0;
    return articles.map((_, index) => {
      return cachedResults[index] || newResults[newResultIndex++];
    });
  }

  async getScenarioArticles(scenarioId) {
    try {
      const result = await query(
        `SELECT 
          a.id as article_id,
          a.content,
          ar.sentiment,
          ar.score,
          ar.translation,
          ar.highlights,
          ar.translated_highlights as "translatedHighlights"
         FROM articles a
         LEFT JOIN analysis_results ar ON a.id = ar.article_id
         WHERE a.scenario_id = $1
         ORDER BY a.created_at DESC`,
        [scenarioId]
      );

      const articles = result.rows;
      
      if (articles.length === 0) {
        return { articles: [], results: null };
      }

      // 构造结果对象
      const analysisResults = {
        totalArticles: articles.length,
        sentimentDistribution: this._calculateOverallSentiment(articles),
        themes: this._generateThemesFromCache(articles),
        individualResults: articles.map(article => ({
          sentiment: article.sentiment,
          score: article.score,
          translation: article.translation,
          highlights: article.highlights,
          translatedHighlights: article.translatedHighlights
        }))
      };

      return {
        articles: articles.map(article => ({
          id: article.article_id,
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