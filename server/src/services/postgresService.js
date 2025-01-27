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

// 创建数据库连接池配置
const createPoolConfig = () => {
  try {
    const dbUrl = validateDbUrl();
    const config = parseDbUrl(dbUrl);
    return {
      ...config,
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 连接最大空闲时间
      connectionTimeoutMillis: 2000, // 连接超时时间
      maxUses: 7500, // 每个连接最大使用次数
      allowExitOnIdle: true
    };
  } catch (error) {
    console.error('创建数据库配置失败:', error);
    throw error;
  }
};

let pool;

// 创建或获取连接池
const getPool = () => {
  if (!pool) {
    pool = new Pool(createPoolConfig());
    
    // 错误处理
    pool.on('error', (err, client) => {
      console.error('数据库连接池错误:', err);
      console.error('发生错误的客户端:', client);
    });

    pool.on('connect', () => {
      console.log('新的数据库连接已建立');
    });

    pool.on('remove', () => {
      console.log('数据库连接已关闭');
    });
  }
  return pool;
};

// 执行查询的包装函数，包含重试逻辑
const executeQuery = async (text, params, retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const client = await getPool().connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } catch (error) {
      lastError = error;
      console.error(`查询执行失败 (尝试 ${i + 1}/${retries}):`, error);
      
      if (error.code === 'ECONNREFUSED' || error.code === '57P01') {
        // 如果是连接错误，重新创建连接池
        pool = null;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 延迟重试
        continue;
      }
      
      throw error; // 对于其他错误直接抛出
    }
  }
  
  throw lastError;
};

class DatabaseService {
  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async initDatabase() {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // 创建索引
      await client.query('CREATE INDEX IF NOT EXISTS idx_content_hash ON articles(content_hash)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_expires_at ON analysis_results(expires_at)');

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
    return executeQuery(
      `SELECT ar.* 
       FROM analysis_results ar
       JOIN articles c ON ar.article_id = c.id
       WHERE c.content_hash = $1 
         AND (ar.expires_at IS NULL OR ar.expires_at > NOW())`,
      [hash]
    ).then(result => {
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
    });
  }

  async saveAnalysis(content, result) {
    const hash = this.generateHash(content);
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      // 插入或获取文章
      const articleResult = await client.query(
        `INSERT INTO articles (content, content_hash)
         VALUES ($1, $2)
         ON CONFLICT (content_hash) DO UPDATE SET updated_at = NOW()
         RETURNING id`,
        [content, hash]
      );

      const articleId = articleResult.rows[0].id;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // 插入分析结果
      await client.query(
        `INSERT INTO analysis_results (
          article_id, sentiment, score, translation,
          highlights, translated_highlights, keywords, summary, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          articleId,
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

  async clearArticles() {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      
      // 清空分析结果表
      await client.query('DELETE FROM analysis_results');
      
      // 清空文章表
      await client.query('DELETE FROM articles');
      
      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('清空文章数据失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

// 导出的查询函数现在使用新的执行器
const query = (text, params) => executeQuery(text, params);

// 初始化数据库
const initDatabase = async () => {
  try {
    await query('SELECT NOW()');
    console.log('数据库连接测试成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

const dbService = new DatabaseService();

module.exports = {
  initDatabase,
  query,
  getPool,
  dbService
}; 