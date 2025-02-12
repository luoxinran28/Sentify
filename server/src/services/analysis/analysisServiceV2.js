const deepseekService = require('../deepseekService');
const crypto = require('crypto');
const { query } = require('../database/query');

class AnalysisService {
  async analyzeArticles(articles, scenarioId, userId) {
    try {
      // 验证用户权限
      await this._validateUserAccess(scenarioId, userId);

      // 检查缓存
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

      // 获取未缓存的文章
      const uncachedArticles = articles.filter((_, index) => !cachedResults[index]);
      
      // 调用 API 分析未缓存的文章
      const apiResult = await deepseekService.analyze(uncachedArticles, scenarioId, userId);

      // 保存新的分析结果到数据库
      await this._saveAnalysisResult(articles, apiResult.analyses, scenarioId, userId);

      // 合并缓存和新分析的结果
      const finalResults = this._mergeCachedAndNewResults(articles, cachedResults, apiResult.analyses);

      return {
        analyses: finalResults,
        overallSentiment: this._calculateOverallSentiment(finalResults),
        resultsAttributes: apiResult.resultsAttributes
      };
    } catch (error) {
      console.error('文章分析错误:', error);
      throw new Error(`分析失败: ${error.message}`);
    }
  }

  async _validateUserAccess(scenarioId, userId) {
    const result = await query(
      `SELECT id FROM scenarios WHERE id = $1 AND user_id = $2`,
      [scenarioId, userId]
    );
    if (result.rows.length === 0) {
      throw new Error('无权访问该场景或场景不存在');
    }
    return true;
  }

  async _getCachedResults(articles) {
    return Promise.all(
      articles.map(async (article) => {
        try {
          const contentHash = this._generateContentHash(article);
          const result = await query(
            `SELECT 
              ar.confidence,
              ar.confidence_distribution as "confidenceDistribution",
              ar.translation,
              ar.highlights,
              ar.translated_highlights as "translatedHighlights",
              ar.reasoning,
              ar.brief,
              s.code as sentiment,
              s.name_zh as "translatedSentiment"
             FROM analysis_results ar
             JOIN articles a ON ar.article_id = a.id
             JOIN sentiments s ON ar.sentiment_id = s.id
             WHERE a.content_hash = $1 
             AND (ar.expires_at IS NULL OR ar.expires_at > NOW())
             ORDER BY ar.created_at DESC
             LIMIT 1`,
            [contentHash]
          );
          return result.rows[0] || null;
        } catch (error) {
          console.error('获取缓存结果错误:', error);
          return null;
        }
      })
    );
  }

  async _saveAnalysisResult(articles, results, scenarioId, userId) {
    try {
      // 首先验证用户对场景的访问权限
      const scenarioCheck = await query(
        `SELECT id FROM scenarios WHERE id = $1 AND user_id = $2`,
        [scenarioId, userId]
      );

      if (scenarioCheck.rows.length === 0) {
        throw new Error('无权访问该场景或场景不存在');
      }

      await query('BEGIN');
      for (let i = 0; i < articles.length; i++) {
        const content = articles[i];
        const result = results[i];
        const contentHash = this._generateContentHash(content);

        // // 检查文章是否已存在
        // let articleResult = await query(
        //   'SELECT id FROM articles WHERE content_hash = $1',
        //   [contentHash]
        // );
        const articleResult = await query(
          `INSERT INTO articles (scenario_id, content, content_hash) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [scenarioId, articles[i], contentHash]
        );
        const articleId = articleResult.rows[0].id;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        // let articleId;
        // if (articleResult.rows.length > 0) {
        //   articleId = articleResult.rows[0].id;
        // } else {
        //   const newArticle = await query(
        //     'INSERT INTO articles (content, content_hash, scenario_id) VALUES ($1, $2, $3) RETURNING id',
        //     [content, contentHash, scenarioId]
        //   );
        //   articleId = newArticle.rows[0].id;
        // }

        // 获取情感ID
        const sentimentResult = await query(
          'SELECT id FROM sentiments WHERE code = $1',
          [result.sentiment]
        );

        if (sentimentResult.rows.length === 0) {
          throw new Error(`未找到情感类型: ${result.sentiment}`);
        }

        // const expiresAt = new Date();
        // expiresAt.setDate(expiresAt.getDate() + 30);

        // 确保confidence是一个有效的数字
        const confidence = parseFloat(result.confidence);
        if (isNaN(confidence) || !isFinite(confidence)) {
          console.warn(`Invalid confidence value: ${result.confidence}, using default 0.5`);
          result.confidence = 0.5;
        }

        await query(
          `INSERT INTO analysis_results 
           (article_id, scenario_id, sentiment_id, confidence, confidence_distribution,
            translation, highlights, translated_highlights, reasoning, brief, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            articleId,
            scenarioId,
            sentimentResult.rows[0].id,
            result.confidence,
            result.confidenceDistribution,
            result.translation,
            result.highlights,
            result.translatedHighlights,
            result.reasoning,
            result.brief,
            expiresAt
          ]
        );
      }

      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
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

      const result = await query(
        `SELECT 
          a.id as article_id,
          a.content,
          ar.confidence,
          ar.confidence_distribution,
          ar.translation,
          ar.highlights,
          ar.translated_highlights,
          ar.reasoning,
          ar.brief,
          s.code as sentiment,
          s.name_zh as translated_sentiment
         FROM articles a
         LEFT JOIN analysis_results ar ON a.id = ar.article_id
         LEFT JOIN sentiments s ON ar.sentiment_id = s.id
         WHERE a.scenario_id = $1
         ORDER BY a.created_at DESC`,
        [scenarioId]
      );

      if (result.rows.length === 0) {
        return { articles: [], results: null };
      }

      const articles = result.rows.map(row => ({
        id: row.article_id,
        content: row.content
      }));

      const analysisResults = {
        totalArticles: articles.length,
        sentimentDistribution: this._calculateOverallSentiment(result.rows),
        individualResults: result.rows.map(row => ({
          sentiment: row.sentiment,
          translatedSentiment: row.translated_sentiment,
          confidence: row.confidence,
          confidenceDistribution: row.confidence_distribution,
          translation: row.translation,
          highlights: row.highlights,
          translatedHighlights: row.translated_highlights,
          reasoning: row.reasoning,
          brief: row.brief
        }))
      };

      return {
        articles,
        results: analysisResults
      };
    } catch (error) {
      console.error('获取场景文章错误:', error);
      throw error;
    }
  }
}

module.exports = new AnalysisService(); 