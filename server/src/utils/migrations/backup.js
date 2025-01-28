const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function backupData() {
  const client = await pool.connect();
  try {
    console.log('开始备份数据...');
    
    // 备份用户数据
    const users = await client.query('SELECT * FROM users');
    
    // 备份场景数据
    const scenarios = await client.query('SELECT * FROM scenarios');
    
    // 备份文章数据
    const articles = await client.query('SELECT * FROM articles');
    
    // 备份分析结果数据
    const analysisResults = await client.query('SELECT * FROM analysis_results');

    const backup = {
      timestamp: new Date().toISOString(),
      users: users.rows,
      scenarios: scenarios.rows,
      articles: articles.rows,
      analysisResults: analysisResults.rows
    };

    // 创建备份目录
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // 保存备份文件
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(
      path.join(backupDir, filename),
      JSON.stringify(backup, null, 2)
    );

    console.log(`备份完成，文件保存为: ${filename}`);
    return filename;
  } catch (err) {
    console.error('备份失败:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// 如果直接运行此文件则执行备份
if (require.main === module) {
  backupData().catch(console.error);
}

module.exports = backupData; 