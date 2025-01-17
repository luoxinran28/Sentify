const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    // 确保数据库目录存在
    const dbDir = path.join(__dirname, '../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'database.sqlite');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('数据库连接错误:', err);
        reject(err);
        return;
      }
      console.log('数据库连接成功，路径:', dbPath);
    });

    db.serialize(() => {
      // 创建评论表
      db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          content_hash TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建分析结果表
      db.run(`
        CREATE TABLE IF NOT EXISTS analysis_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          comment_id INTEGER NOT NULL,
          sentiment TEXT NOT NULL,
          score REAL NOT NULL,
          translation TEXT NOT NULL,
          highlights TEXT NOT NULL,
          translated_highlights TEXT NOT NULL,
          keywords TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          FOREIGN KEY (comment_id) REFERENCES comments(id)
        )
      `);

      // 创建索引
      db.run(`CREATE INDEX IF NOT EXISTS idx_content_hash ON comments(content_hash)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_expires_at ON analysis_results(expires_at)`, 
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // 监听数据库错误
    db.on('error', (err) => {
      console.error('数据库错误:', err);
    });

    // 完成后关闭连接
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接错误:', err);
      }
    });
  });
};

module.exports = initDatabase; 