const { query } = require('./initDatabaseService');

class ScenarioService {
  async getScenarios(userId) {
    try {
      const result = await query(
        `SELECT id, title_en, title_zh, source, prompt, created_at, updated_at
         FROM scenarios
         WHERE user_id = $1 
         AND deleted_at IS NULL
         ORDER BY updated_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (err) {
      throw new Error(`获取场景列表失败: ${err.message}`);
    }
  }

  async createScenario(userId, { titleEn, titleZh, source, prompt }) {
    try {
      // 检查用户场景数量
      const countResult = await query(
        'SELECT COUNT(*) FROM scenarios WHERE user_id = $1 AND deleted_at IS NULL',
        [userId]
      );
      
      if (parseInt(countResult.rows[0].count) >= 5) {
        throw new Error('已达到场景数量上限（5个）');
      }

      const result = await query(
        `INSERT INTO scenarios (user_id, title_en, title_zh, source, prompt)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title_en, title_zh, source, prompt, created_at, updated_at`,
        [userId, titleEn, titleZh, source, prompt]
      );
      
      return result.rows[0];
    } catch (err) {
      if (err.message.includes('场景数量上限')) {
        throw err;
      }
      throw new Error(`创建场景失败: ${err.message}`);
    }
  }

  async updateScenario(userId, scenarioId, { titleEn, titleZh, source, prompt }) {
    try {
      const result = await query(
        `UPDATE scenarios 
         SET title_en = $1, title_zh = $2, source = $3, prompt = $4, 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 AND user_id = $6 AND deleted_at IS NULL
         RETURNING id, title_en, title_zh, source, prompt, updated_at`,
        [titleEn, titleZh, source, prompt, scenarioId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('场景不存在或无权限修改');
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`更新场景失败: ${err.message}`);
    }
  }

  async deleteScenario(userId, scenarioId) {
    try {
      const result = await query(
        `UPDATE scenarios 
         SET deleted_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [scenarioId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('场景不存在或无权限删除');
      }

      return true;
    } catch (err) {
      throw new Error(`删除场景失败: ${err.message}`);
    }
  }

  async getScenarioById(userId, scenarioId) {
    try {
      const result = await query(
        `SELECT id, title_en, title_zh, source, prompt, created_at, updated_at
         FROM scenarios
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
        [scenarioId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('场景不存在或无权限访问');
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(`获取场景详情失败: ${err.message}`);
    }
  }
}

module.exports = new ScenarioService(); 