// 临时文件，用于平滑过渡
const { query, executeQuery } = require('./database/query');
const { getPool } = require('./database/pool');
const databaseService = require('./database/databaseService');

module.exports = {
  query,
  executeQuery,
  getPool,
  dbService: databaseService
}; 