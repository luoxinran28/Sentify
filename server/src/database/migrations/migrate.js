const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const createTables = `
  -- 创建用户表
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    access_code CHAR(4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
  );

  -- 创建场景表
  CREATE TABLE IF NOT EXISTS scenarios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_zh VARCHAR(255) NOT NULL,
    source TEXT,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_scenarios_limit CHECK (
      (SELECT COUNT(*) FROM scenarios s2 
       WHERE s2.user_id = user_id 
       AND s2.deleted_at IS NULL) <= 5
    )
  );

  -- 创建索引
  CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id);
  CREATE INDEX IF NOT EXISTS idx_scenarios_updated_at ON scenarios(updated_at);

  -- 创建文章表（替代原 comments 表）
  CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
  );

  -- 创建分析结果表
  CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    scenario_id INTEGER NOT NULL,
    sentiment VARCHAR(50),
    score DECIMAL,
    translation TEXT,
    highlights JSONB,
    translated_highlights JSONB,
    keywords JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
  );
`;

const dropTables = `
  DROP TABLE IF EXISTS analysis_results;
  DROP TABLE IF EXISTS articles;
  DROP TABLE IF EXISTS scenarios;
  DROP TABLE IF EXISTS users;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    if (process.argv[2] === 'revert') {
      console.log('Reverting migrations...');
      await client.query(dropTables);
      console.log('Successfully reverted migrations');
    } else {
      console.log('Running migrations...');
      await client.query(createTables);
      console.log('Successfully ran migrations');
    }
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error); 