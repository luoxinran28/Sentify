const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// 验证数据库连接URL
const validateDbUrl = () => {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('数据库连接URL未配置 (POSTGRES_URL)');
  }
  return url;
};

// 解析数据库连接URL
const parseDbUrl = (url) => {
  try {
    const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):?([^\/]+)?\/(.+)/;
    const matches = url.match(regex);
    if (!matches) {
      throw new Error('数据库URL格式无效: ' + url);
    }
    
    return {
      user: matches[1],
      password: matches[2],
      host: matches[3],
      port: matches[4] || '5432',
      database: matches[5].split('?')[0],
      ssl: {
        rejectUnauthorized: false
      }
    };
  } catch (error) {
    console.error('数据库URL解析错误:', error);
    throw error;
  }
};

// 创建数据库连接池
const createPool = () => {
  try {
    const dbUrl = validateDbUrl();
    const config = parseDbUrl(dbUrl);
    return new Pool(config);
  } catch (error) {
    console.error('创建数据库连接池失败:', error);
    throw error;
  }
};

const pool = createPool();

// 测试连接
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err);
});

pool.on('connect', () => {
  console.log('数据库连接成功');
});

class DatabaseService {
  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async initDatabase() {
    const client = await pool.connect();
    try {
      // 开始事务
      await client.query('BEGIN');

      // 创建评论表
      await client.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          content_hash TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建分析结果表
      await client.query(`
        CREATE TABLE IF NOT EXISTS analysis_results (
          id SERIAL PRIMARY KEY,
          comment_id INTEGER NOT NULL,
          sentiment TEXT NOT NULL,
          score REAL NOT NULL,
          translation TEXT NOT NULL,
          highlights JSONB NOT NULL,
          translated_highlights JSONB NOT NULL,
          keywords JSONB NOT NULL,
          summary TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP,
          FOREIGN KEY (comment_id) REFERENCES comments(id)
        )
      `);

      // 创建索引
      await client.query('CREATE INDEX IF NOT EXISTS idx_content_hash ON comments(content_hash)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_expires_at ON analysis_results(expires_at)');

      // 提交事务
      await client.query('COMMIT');
      console.log('数据库初始化成功');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('数据库初始化失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async findAnalysisByContent(content) {
    const hash = this.generateHash(content);
    try {
      const result = await pool.query(
        `SELECT ar.* 
         FROM analysis_results ar
         JOIN comments c ON ar.comment_id = c.id
         WHERE c.content_hash = $1 
           AND (ar.expires_at IS NULL OR ar.expires_at > NOW())`,
        [hash]
      );
      
      if (result.rows[0]) {
        const row = result.rows[0];
        return {
          sentiment: row.sentiment,
          score: row.score,
          translation: row.translation,
          highlights: row.highlights,
          translated_highlights: row.translated_highlights,
          keywords: row.keywords,
          summary: row.summary
        };
      }
      return null;
    } catch (error) {
      console.error('查询分析结果失败:', error);
      throw error;
    }
  }

  async saveAnalysis(content, result) {
    const hash = this.generateHash(content);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 插入或获取评论
      const commentResult = await client.query(
        `INSERT INTO comments (content, content_hash)
         VALUES ($1, $2)
         ON CONFLICT (content_hash) DO UPDATE SET updated_at = NOW()
         RETURNING id`,
        [content, hash]
      );

      const commentId = commentResult.rows[0].id;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // 插入分析结果
      await client.query(
        `INSERT INTO analysis_results (
          comment_id, sentiment, score, translation,
          highlights, translated_highlights, keywords, summary, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          commentId,
          result.sentiment,
          result.score,
          result.translation,
          JSON.stringify(result.highlights),
          JSON.stringify(result.translatedHighlights),
          JSON.stringify(result.keywords),
          result.summary,
          expiresAt
        ]
      );

      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('保存分析结果失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async _safeParseJSON(jsonString, defaultValue = null) {
    try {
      // 如果已经是对象，直接返回
      if (typeof jsonString === 'object' && jsonString !== null) {
        return jsonString;
      }
      return jsonString ? JSON.parse(jsonString) : defaultValue;
    } catch (error) {
      console.error('JSON解析错误:', error);
      return defaultValue;
    }
  }

  async clearComments() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 清空分析结果表
      await client.query('DELETE FROM analysis_results');
      
      // 清空评论表
      await client.query('DELETE FROM comments');
      
      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('清空评论数据失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new DatabaseService(); 