const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

module.exports = {
  getPool: () => pool,
  query: (text, params) => pool.query(text, params),
}; 