const { query } = require('./database/query');

// 统一的数据转换函数
const transformScenario = (row) => ({
  id: row.id,
  titleEn: row.title_en,
  titleZh: row.title_zh,
  source: row.source,
  prompt: row.prompt,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
  userId: row.user_id,
  count: row.count
});

class ScenarioService {
  async createScenario(data) {
    try {
      const result = await query(
        `INSERT INTO scenarios (title_en, title_zh, source, prompt, user_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.titleEn, data.titleZh, data.source, data.prompt, data.userId]
      );

      return transformScenario(result.rows[0]);
    } catch (error) {
      console.error('创建场景失败:', error);
      throw error;
    }
  }

  async getScenarios(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const result = await query(
        `SELECT s.*, COUNT(a.id) as count
         FROM scenarios s
         LEFT JOIN articles a ON s.id = a.scenario_id
         GROUP BY s.id
         ORDER BY s.updated_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await query('SELECT COUNT(*) as total FROM scenarios');
      const total = parseInt(countResult.rows[0].total);

      return {
        scenarios: result.rows.map(transformScenario),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      };
    } catch (error) {
      console.error('获取场景列表失败:', error);
      throw error;
    }
  }

  async updateScenario(id, data) {
    try {
      const result = await query(
        `UPDATE scenarios 
         SET title_en = $1, title_zh = $2, source = $3, prompt = $4, updated_at = NOW()
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [data.titleEn, data.titleZh, data.source, data.prompt, id, data.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('场景不存在或无权限修改');
      }

      return transformScenario(result.rows[0]);
    } catch (error) {
      console.error('更新场景失败:', error);
      throw error;
    }
  }

  async deleteScenario(id, userId) {
    try {
      const result = await query(
        `DELETE FROM scenarios
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('场景不存在或无权限删除');
      }

      return transformScenario(result.rows[0]);
    } catch (error) {
      console.error('删除场景失败:', error);
      throw error;
    }
  }
}

module.exports = new ScenarioService(); 