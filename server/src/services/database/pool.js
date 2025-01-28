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
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxUses: 7500,
      allowExitOnIdle: true
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

module.exports = {
  getPool
};