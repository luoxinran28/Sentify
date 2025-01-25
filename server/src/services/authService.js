const { query } = require('./initDatabaseService');

// 验证访问码
const verifyAndCreateUser = async (encryptedCode) => {
  try {
    // 检查用户是否已存在
    const existingUser = await query(
      'SELECT * FROM users WHERE access_code = $1',
      [encryptedCode]
    );

    if (existingUser.rows.length > 0) {
      return {
        success: true,
        user: existingUser.rows[0]
      };
    }

    // 如果用户不存在，创建新用户
    const newUser = await query(
      'INSERT INTO users (email, access_code) VALUES ($1, $2) RETURNING *',
      ['luo.xinran@foxmail.com', encryptedCode]
    );

    return {
      success: true,
      user: newUser.rows[0]
    };
  } catch (error) {
    console.error('验证码验证错误:', error);
    throw new Error('验证失败，请稍后重试');
  }
};

module.exports = {
  verifyAndCreateUser
}; 