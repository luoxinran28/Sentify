const { getPool } = require('./pool');

const executeQuery = async (text, params, retries = 3) => {
  let lastError;
  let pool = getPool();
  
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } catch (error) {
      lastError = error;
      console.error(`查询执行失败 (尝试 ${i + 1}/${retries}):`, error);
      
      if (error.code === 'ECONNREFUSED' || error.code === '57P01' || 
          error.message.includes('timeout')) {
        // 重置连接池并等待
        pool = null;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        pool = getPool(); // 获取新的连接池
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

const query = (text, params) => executeQuery(text, params);

module.exports = {
  query,
  executeQuery
};