const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

class DatabaseService {
  constructor() {
    const dbDir = path.join(__dirname, '../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'database.sqlite');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('数据库连接错误:', err);
      } else {
        console.log('数据库连接成功');
      }
    });
  }

  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async findAnalysisByContent(content) {
    const hash = this.generateHash(content);
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT ar.* 
         FROM analysis_results ar
         JOIN comments c ON ar.comment_id = c.id
         WHERE c.content_hash = ? AND (ar.expires_at IS NULL OR ar.expires_at > datetime('now'))`,
        [hash],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async saveAnalysis(content, result) {
    const hash = this.generateHash(content);
    const self = this;

    return new Promise((resolve, reject) => {
      let commentId;

      // 先检查评论是否存在
      self.db.get(
        'SELECT id FROM comments WHERE content_hash = ?',
        [hash],
        (err, row) => {
          if (err) {
            return reject(err);
          }

          if (row) {
            // 评论已存在，使用现有ID
            commentId = row.id;
            insertAnalysisResult();
          } else {
            // 评论不存在，插入新评论
            self.db.run(
              `INSERT INTO comments (content, content_hash) VALUES (?, ?)`,
              [content, hash],
              function(err) {
                if (err) {
                  return reject(err);
                }
                commentId = this.lastID;
                insertAnalysisResult();
              }
            );
          }
        }
      );

      function insertAnalysisResult() {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        self.db.run(
          `INSERT INTO analysis_results 
           (comment_id, sentiment, score, translation, highlights, 
            translated_highlights, keywords, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            commentId,
            result.sentiment,
            result.score,
            result.translation,
            JSON.stringify(result.highlights),
            JSON.stringify(result.translatedHighlights),
            JSON.stringify(result.keywords),
            expiresAt.toISOString()
          ],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      }
    });
  }

  // 添加关闭数据库的方法
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new DatabaseService(); 