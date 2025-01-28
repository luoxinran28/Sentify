const { query } = require('../services/database/query');

exports.authenticateUser = async (req, res, next) => {
  try {
    // 从请求头获取加密后的验证码
    const encryptedCode = req.headers['x-access-code'];
    
    if (!encryptedCode) {
      return res.status(401).json({
        success: false,
        message: '未授权访问：缺少访问码'
      });
    }

    // 从数据库查询用户
    const result = await query(
      'SELECT * FROM users WHERE access_code = $1 AND is_active = true',
      [encryptedCode]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '无效的验证码或用户已禁用'
      });
    }

    // 将用户信息添加到请求对象
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '认证过程中发生错误'
    });
  }
}; 