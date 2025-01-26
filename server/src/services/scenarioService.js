const { query } = require('./initDatabaseService');
const ITEMS_PER_PAGE = 10;

class ScenarioService {
  async createScenario(userId, data) {
    const { titleEn, titleZh, source, prompt } = data;
    
    // 检查用户场景数量
    const countResult = await query(
      'SELECT COUNT(*) FROM scenarios WHERE user_id = $1',
      [userId]
    );
    
    if (parseInt(countResult.rows[0].count) >= 10) {
      throw new Error('已达到场景数量上限（10个）');
    }

    // 创建场景
    const result = await query(
      `INSERT INTO scenarios (user_id, title_en, title_zh, source, prompt)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, titleEn, titleZh, source, prompt]
    );
    
    return result.rows[0];
  }

  async getScenarios(page = 1) {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    
    const result = await query(
      `SELECT s.*, 
        COUNT(a.id) as article_count,
        COUNT(*) OVER() as total_count
       FROM scenarios s
       LEFT JOIN articles a ON s.id = a.scenario_id
       GROUP BY s.id
       ORDER BY s.updated_at DESC 
       LIMIT $1 OFFSET $2`,
      [ITEMS_PER_PAGE, offset]
    );

    const totalItems = result.rows[0]?.total_count || 0;

    return {
      scenarios: result.rows.map(row => ({
        id: row.id,
        titleEn: row.title_en,
        titleZh: row.title_zh,
        source: row.source,
        prompt: row.prompt,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        count: parseInt(row.article_count)
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
        totalItems
      }
    };
  }

  async updateScenario(id, data) {
    const { titleEn, titleZh, source, prompt } = data;
    
    const result = await query(
      `UPDATE scenarios 
       SET title_en = $1, title_zh = $2, source = $3, prompt = $4, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [titleEn, titleZh, source, prompt, id]
    );
    
    return result.rows[0];
  }

  async deleteScenario(id) {
    // 使用事务确保数据一致性
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 删除分析结果
      await client.query(
        'DELETE FROM analysis_results WHERE scenario_id = $1',
        [id]
      );
      
      // 删除文章
      await client.query(
        'DELETE FROM articles WHERE scenario_id = $1',
        [id]
      );
      
      // 删除场景
      const result = await client.query(
        'DELETE FROM scenarios WHERE id = $1 RETURNING *',
        [id]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ScenarioService(); 