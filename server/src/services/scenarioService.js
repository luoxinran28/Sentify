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

// 转换情感类型数据
const transformSentiment = (row) => ({
  id: row.id,
  code: row.code,
  nameEn: row.name_en,
  nameZh: row.name_zh,
  description: row.description,
  category: row.category
});

class ScenarioService {
  async createScenario(userId, data) {
    try {
      const result = await query(
        `INSERT INTO scenarios (title_en, title_zh, source, prompt, user_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.titleEn, data.titleZh, data.source, data.prompt, userId]
      );

      return transformScenario(result.rows[0]);
    } catch (error) {
      console.error('创建场景失败:', error);
      throw error;
    }
  }

  async getScenarios(page = 1, limit = 20) {
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
      // 开始事务
      await query('BEGIN');

      try {
        // 首先删除场景相关的分析结果
        await query(
          `DELETE FROM analysis_results
           WHERE article_id IN (
             SELECT id FROM articles WHERE scenario_id = $1
           )`,
          [id]
        );

        // 然后删除场景相关的文章
        await query(
          `DELETE FROM articles
           WHERE scenario_id = $1`,
          [id]
        );

        // 最后删除场景本身
        const result = await query(
          `DELETE FROM scenarios
           WHERE id = $1 AND user_id = $2
           RETURNING *`,
          [id, userId]
        );

        if (result.rows.length === 0) {
          throw new Error('场景不存在或无权限删除');
        }

        // 提交事务
        await query('COMMIT');

        return transformScenario(result.rows[0]);
      } catch (error) {
        // 如果出错，回滚事务
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('删除场景失败:', error);
      throw error;
    }
  }

  async getScenarioById(id, userId) {
    try {
      const result = await query(
        `SELECT s.*, COUNT(a.id) as count
         FROM scenarios s
         LEFT JOIN articles a ON s.id = a.scenario_id
         WHERE s.id = $1 AND s.user_id = $2
         GROUP BY s.id`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return transformScenario(result.rows[0]);
    } catch (error) {
      console.error('获取场景详情错误:', error);
      throw new Error('获取场景详情失败');
    }
  }

  // 获取场景的情感类型
  async getScenarioSentiments(scenarioId, userId) {
    try {
      // 首先验证用户对场景的访问权限
      const scenarioCheck = await query(
        `SELECT id FROM scenarios WHERE id = $1 AND user_id = $2`,
        [scenarioId, userId]
      );

      if (scenarioCheck.rows.length === 0) {
        throw new Error('场景不存在或无权访问');
      }

      const result = await query(
        `SELECT s.* 
         FROM sentiments s
         JOIN scenario_sentiments ss ON s.id = ss.sentiment_id
         WHERE ss.scenario_id = $1
         ORDER BY s.name_zh`,
        [scenarioId]
      );

      return result.rows.map(transformSentiment);
    } catch (error) {
      console.error('获取场景情感类型失败:', error);
      throw error;
    }
  }

  // 添加情感类型到场景
  async addSentimentToScenario(scenarioId, sentimentId, userId) {
    try {
      // 首先验证用户对场景的访问权限
      const scenarioCheck = await query(
        `SELECT id FROM scenarios WHERE id = $1 AND user_id = $2`,
        [scenarioId, userId]
      );

      if (scenarioCheck.rows.length === 0) {
        throw new Error('场景不存在或无权访问');
      }

      // 验证情感类型是否存在
      const sentimentCheck = await query(
        `SELECT id FROM sentiments WHERE id = $1`,
        [sentimentId]
      );

      if (sentimentCheck.rows.length === 0) {
        throw new Error('情感类型不存在');
      }

      // 添加关联
      await query(
        `INSERT INTO scenario_sentiments (scenario_id, sentiment_id)
         VALUES ($1, $2)
         ON CONFLICT (scenario_id, sentiment_id) DO NOTHING`,
        [scenarioId, sentimentId]
      );

      return { success: true };
    } catch (error) {
      console.error('添加情感类型到场景失败:', error);
      throw error;
    }
  }

  // 从场景中移除情感类型
  async removeSentimentFromScenario(scenarioId, sentimentId, userId) {
    try {
      // 首先验证用户对场景的访问权限
      const scenarioCheck = await query(
        `SELECT id FROM scenarios WHERE id = $1 AND user_id = $2`,
        [scenarioId, userId]
      );

      if (scenarioCheck.rows.length === 0) {
        throw new Error('场景不存在或无权访问');
      }

      // 检查是否至少保留一种情感类型
      const countResult = await query(
        `SELECT COUNT(*) as count FROM scenario_sentiments WHERE scenario_id = $1`,
        [scenarioId]
      );
      
      if (parseInt(countResult.rows[0].count) <= 1) {
        throw new Error('场景至少需要保留一种情感类型');
      }

      // 移除关联
      await query(
        `DELETE FROM scenario_sentiments 
         WHERE scenario_id = $1 AND sentiment_id = $2`,
        [scenarioId, sentimentId]
      );

      return { success: true };
    } catch (error) {
      console.error('从场景中移除情感类型失败:', error);
      throw error;
    }
  }

  // 获取所有可用的情感类型
  async getAllSentiments() {
    try {
      const result = await query(
        `SELECT * FROM sentiments ORDER BY name_zh`
      );

      return result.rows.map(transformSentiment);
    } catch (error) {
      console.error('获取所有情感类型失败:', error);
      throw error;
    }
  }

  // 创建新的情感类型
  async createSentiment(data) {
    try {
      const result = await query(
        `INSERT INTO sentiments (code, name_en, name_zh, description, category)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.code, data.nameEn, data.nameZh, data.description, data.category]
      );

      return transformSentiment(result.rows[0]);
    } catch (error) {
      console.error('创建情感类型失败:', error);
      throw error;
    }
  }
}

module.exports = new ScenarioService(); 