const { query } = require('../database/query');

class ArticleService {
  async listArticlesWithPagination(scenarioId, userId, page, limit) {
    const offset = (page - 1) * limit;
    
    try {
      // 验证用户权限
      const scenarioCheck = await query(
        `SELECT id FROM scenarios WHERE id = $1 AND user_id = $2`,
        [scenarioId, userId]
      );

      if (scenarioCheck.rows.length === 0) {
        throw new Error('无权访问该场景或场景不存在');
      }

      const articlesQuery = `
        SELECT 
          id, 
          content, 
          created_at as "createdAt"
        FROM articles 
        WHERE scenario_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM articles
        WHERE scenario_id = $1
      `;
      
      const [articlesResult, countResult] = await Promise.all([
        query(articlesQuery, [scenarioId, limit, offset]),
        query(countQuery, [scenarioId])
      ]);

      const articles = articlesResult.rows;
      const total = parseInt(countResult.rows[0].total);

      return {
        articles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      };
    } catch (error) {
      console.error('获取场景文章错误:', error);
      throw new Error('获取场景文章失败');
    }
  }

  async deleteArticles(scenarioId, articleIds) {
    try {
      await query('BEGIN');

      // 首先删除相关的分析结果
      await query(
        `DELETE FROM analysis_results 
         WHERE article_id = ANY($1::int[])
         AND scenario_id = $2`,
        [articleIds, scenarioId]
      );

      // 然后删除文章
      const result = await query(
        `DELETE FROM articles 
         WHERE id = ANY($1::int[])
         AND scenario_id = $2
         RETURNING id`,
        [articleIds, scenarioId]
      );

      await query('COMMIT');

      if (result.rows.length === 0) {
        throw new Error('未找到指定的文章');
      }

      return {
        success: true,
        deletedCount: result.rows.length
      };
    } catch (error) {
      await query('ROLLBACK');
      console.error('删除文章错误:', error);
      throw new Error(`删除文章失败: ${error.message}`);
    }
  }

  async clearArticles(scenarioId) {
    try {
      await query('BEGIN');

      // 首先删除该场景下所有文章的分析结果
      await query(
        `DELETE FROM analysis_results 
         WHERE scenario_id = $1`,
        [scenarioId]
      );

      // 然后删除该场景下的所有文章
      const result = await query(
        `DELETE FROM articles 
         WHERE scenario_id = $1
         RETURNING id`,
        [scenarioId]
      );

      await query('COMMIT');

      return {
        success: true,
        deletedCount: result.rows.length
      };
    } catch (error) {
      await query('ROLLBACK');
      console.error('清空文章错误:', error);
      throw new Error(`清空文章失败: ${error.message}`);
    }
  }
}

module.exports = new ArticleService(); 