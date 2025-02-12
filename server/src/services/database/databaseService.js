const crypto = require('crypto');
const { query } = require('./query');

class DatabaseService {
  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async findAnalysisByContent(content) {
    const hash = this.generateHash(content);
    try {
      const result = await query(
        `SELECT 
          ar.*,
          s.code as sentiment_code,
          s.name_en as sentiment_name_en,
          s.name_zh as sentiment_name_zh
         FROM analysis_results ar
         JOIN articles a ON ar.article_id = a.id
         LEFT JOIN sentiments s ON ar.sentiment_id = s.id
         WHERE a.content_hash = $1 
         AND (ar.expires_at IS NULL OR ar.expires_at > NOW())`,
        [hash]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  async saveAnalysis(content, result, scenarioId) {
    const hash = this.generateHash(content);
    try {
      await query('BEGIN');

      let articleResult = await query(
        'SELECT id FROM articles WHERE content_hash = $1',
        [hash]
      );

      let articleId;
      if (articleResult.rows.length > 0) {
        articleId = articleResult.rows[0].id;
      } else {
        const newArticle = await query(
          'INSERT INTO articles (content, content_hash, scenario_id) VALUES ($1, $2, $3) RETURNING id',
          [content, hash, scenarioId]
        );
        articleId = newArticle.rows[0].id;
      }

      // 获取情感ID
      const sentimentResult = await query(
        'SELECT id FROM sentiments WHERE code = $1',
        [result.sentiment]
      );

      if (sentimentResult.rows.length === 0) {
        throw new Error(`未找到情感类型: ${result.sentiment}`);
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

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

      await query('COMMIT');
      return result;
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  async clearArticles() {
    try {
      await query('BEGIN');
      await query('DELETE FROM analysis_results');
      await query('DELETE FROM articles');
      await query('COMMIT');
      return { success: true };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  async getScenarioPrompt(scenarioId, userId) {
    try {
      const result = await query(
        `SELECT prompt 
         FROM scenarios 
         WHERE id = $1 AND user_id = $2`,
        [scenarioId, userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('场景不存在或无权访问');
      }
      
      return result.rows[0].prompt;
    } catch (err) {
      throw err;
    }
  }
}

// 导出单例
module.exports = new DatabaseService(); 