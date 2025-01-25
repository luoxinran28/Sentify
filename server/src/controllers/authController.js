const authService = require('../services/authService');

exports.verifyCode = async (req, res) => {
  try {
    const { code: encryptedCode } = req.body;
    
    // 验证码基本验证
    if (!encryptedCode) {
      return res.status(400).json({
        success: false,
        message: '无效的验证码格式'
      });
    }

    const result = await authService.verifyAndCreateUser(encryptedCode);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 