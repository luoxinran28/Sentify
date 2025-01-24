const { query } = require('./initDatabaseService');

class UserService {
  async getUserById(id) {
    try {
      const result = await query(
        'SELECT id, email, created_at, last_login_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (err) {
      throw new Error(`获取用户信息失败: ${err.message}`);
    }
  }

  async updateLastLogin(id) {
    try {
      await query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
    } catch (err) {
      console.error(`更新登录时间失败: ${err.message}`);
    }
  }
}

module.exports = new UserService(); 