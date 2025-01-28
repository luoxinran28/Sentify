const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

// 从 postgresService.js 移植的配置相关代码
const validateDbUrl = () => {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error('数据库连接URL未配置 (POSTGRES_URL)');
  }
  return url;
};

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

const createPoolConfig = () => {
  try {
    const dbUrl = validateDbUrl();
    const config = parseDbUrl(dbUrl);
    return {
      ...config,
      max: 20,                           // 最大连接数
      idleTimeoutMillis: 30000,          // 空闲超时：30秒
      connectionTimeoutMillis: 10000,     // 连接超时：10秒 (增加了超时时间)
      maxUses: 7500,                     // 每个连接最大使用次数
      allowExitOnIdle: true,
      keepAlive: true,                   // 保持连接活跃
      application_name: 'sentify'         // 应用名称，便于调试
    };
  } catch (error) {
    console.error('创建数据库配置失败:', error);
    throw error;
  }
};

let pool;

const getPool = () => {
  if (!pool) {
    pool = new Pool(createPoolConfig());
    
    pool.on('error', (err, client) => {
      console.error('数据库连接池错误:', err);
      console.error('发生错误的客户端:', client);
      // 在致命错误时重置连接池
      if (err.code === 'ECONNREFUSED' || err.code === '57P01') {
        console.log('检测到致命错误，重置连接池');
        pool = null;
      }
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

// 添加一个测试连接的函数
const testConnection = async () => {
  try {
    const client = await getPool().connect();
    try {
      await client.query('SELECT NOW()');
      console.log('数据库连接测试成功');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
};

module.exports = {
  getPool,
  testConnection
};