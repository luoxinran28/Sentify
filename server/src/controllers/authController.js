const authService = require('../services/authService');

exports.verifyAccessCode = async (req, res) => {
  try {
    const encryptedCode = req.headers['x-access-code'];
    
    // 验证码基本验证
    if (!encryptedCode) {
      return res.status(401).json({
        success: false,
        details: '未提供验证码'
      });
    }

    const result = await authService.verifyAndCreateUser(encryptedCode);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        details: result.message || '验证码无效'
      });
    }

    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('验证处理错误:', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      details: '服务器处理验证请求时出错'
    });
  }
}; 