const { query } = require('./initDatabaseService');
const deepseekService = require('./deepseekService');
const crypto = require('crypto');

class ArticleAnalysisService {
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
            `SELECT ar.* FROM analysis_results ar
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
    for (let i = 0; i < articles.length; i++) {
      try {
        await query('BEGIN');

        // 保存文章
        const contentHash = this._generateContentHash(articles[i]);
        const articleResult = await query(
          `INSERT INTO articles (scenario_id, content, content_hash) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [scenarioId, articles[i], contentHash]
        );

        const articleId = articleResult.rows[0].id;

        // 设置过期时间（30天）
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // 保存分析结果
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

        await query('COMMIT');
      } catch (error) {
        await query('ROLLBACK');
        console.error('保存分析结果错误:', error);
        throw error;
      }
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

  async clearArticles(scenarioId) {
    try {
      await query('BEGIN');
      
      // 删除分析结果
      await query(
        `DELETE FROM analysis_results ar
         USING articles a
         WHERE ar.article_id = a.id
         AND a.scenario_id = $1`,
        [scenarioId]
      );
      
      // 删除文章
      await query(
        'DELETE FROM articles WHERE scenario_id = $1',
        [scenarioId]
      );
      
      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = new ArticleAnalysisService(); 