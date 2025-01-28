const { query } = require('../services/database/query');

exports.authenticateUser = async (req, res, next) => {
  try {
    // 从请求头获取加密后的验证码
    const encryptedCode = req.headers['x-access-code'];
    
    if (!encryptedCode) {
      return res.status(401).json({
        success: false,
        message: '未授权访问'
      });
    }

    // 从数据库查询用户
    const result = await query(
      'SELECT * FROM users WHERE access_code = $1',
      [encryptedCode]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '无效的验证码'
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
}; 