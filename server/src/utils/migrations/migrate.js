const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const backupData = require('./backup');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const createTables = `
  -- 创建用户表
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    access_code VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
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
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- 创建文章表
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

const updateTables = `
  -- 添加 is_active 列（如果不存在）
  DO $$ 
  BEGIN 
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='is_active'
    ) THEN 
      ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
  END $$;

  -- 确保外键约束正确设置
  ALTER TABLE analysis_results 
  DROP CONSTRAINT IF EXISTS analysis_results_article_id_fkey,
  ADD CONSTRAINT analysis_results_article_id_fkey 
  FOREIGN KEY (article_id) 
  REFERENCES articles(id) 
  ON DELETE CASCADE;
`;

const dropTables = `
  DROP TABLE IF EXISTS analysis_results;
  DROP TABLE IF EXISTS articles;
  DROP TABLE IF EXISTS scenarios;
  DROP TABLE IF EXISTS users;
`;

async function restoreBackup(filename) {
  const client = await pool.connect();
  try {
    console.log('开始恢复数据...');
    const backupData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'backups', filename), 'utf8')
    );

    await client.query('BEGIN');

    // 恢复用户数据
    for (const user of backupData.users) {
      await client.query(
        `INSERT INTO users (id, email, access_code, created_at, last_login_at) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE 
         SET email = EXCLUDED.email,
             access_code = EXCLUDED.access_code`,
        [user.id, user.email, user.access_code, user.created_at, user.last_login_at]
      );
    }

    // 恢复其他表数据...
    // ... 类似的恢复逻辑 ...

    await client.query('COMMIT');
    console.log('数据恢复完成');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('恢复失败:', err);
    throw err;
  } finally {
    client.release();
  }
}

async function migrate() {
  const client = await pool.connect();
  try {
    const command = process.argv[2];
    
    if (command === 'backup') {
      await backupData();
    }
    else if (command === 'restore') {
      const filename = process.argv[3];
      if (!filename) {
        throw new Error('请指定要恢复的备份文件名');
      }
      await restoreBackup(filename);
    }
    else if (command === 'revert') {
      console.log('回滚迁移...');
      await client.query(dropTables);
      console.log('成功回滚迁移');
    }
    else if (command === 'update') {
      console.log('更新数据库结构...');
      await client.query(updateTables);
      console.log('成功更新数据库结构');
    }
    else {
      console.log('执行完整迁移...');
      await client.query(createTables);
      console.log('成功完成迁移');
    }
  } catch (err) {
    console.error('迁移失败:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error); 