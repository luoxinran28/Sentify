const { query } = require('./initDatabaseService');
const deepseekService = require('./deepseekService');

class ArticleAnalysisService {
  async analyzeArticles(articles) {
    try {
      // 检查缓存
      const cachedResults = await this._getCachedResults(articles);

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
      
      // 调用 DeepSeek API 分析未缓存的文章
      const apiResult = await deepseekService.analyze(uncachedArticles);

      // 保存新的分析结果到数据库
      await this._saveAnalysisResults(uncachedArticles, apiResult.analyses);

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

  async _getCachedResults(articles) {
    return Promise.all(
      articles.map(async (article) => {
        try {
          const result = await query(
            `SELECT * FROM analysis_results ar
             JOIN articles a ON ar.article_id = a.id
             WHERE a.content = $1 
             AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
             ORDER BY ar.created_at DESC
             LIMIT 1`,
            [article]
          );
          return result.rows[0] || null;
        } catch (error) {
          console.error('获取缓存结果错误:', error);
          return null;
        }
      })
    );
  }

  async _saveAnalysisResults(articles, results) {
    for (let i = 0; i < articles.length; i++) {
      try {
        await query('BEGIN');

        // 保存文章
        const articleResult = await query(
          'INSERT INTO articles (content) VALUES ($1) RETURNING id',
          [articles[i]]
        );

        const articleId = articleResult.rows[0].id;

        // 设置过期时间（30天）
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // 保存分析结果
        await query(
          `INSERT INTO analysis_results 
           (article_id, sentiment, score, translation, highlights, 
            translated_highlights, summary, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            articleId,
            results[i].sentiment,
            results[i].score,
            results[i].translation,
            JSON.stringify(results[i].highlights),
            JSON.stringify(results[i].translatedHighlights),
            results[i].summary,
            expiresAt
          ]
        );

        await query('COMMIT');
      } catch (error) {
        await query('ROLLBACK');
        console.error('保存分析结果错误:', error);
      }
    }
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

  async clearArticles(userId) {
    try {
      await query('BEGIN');
      
      // 删除分析结果
      await query(
        `DELETE FROM analysis_results ar
         USING articles a
         WHERE ar.article_id = a.id
         AND a.user_id = $1`,
        [userId]
      );
      
      // 删除文章
      await query(
        'DELETE FROM articles WHERE user_id = $1',
        [userId]
      );
      
      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = new ArticleAnalysisService(); 