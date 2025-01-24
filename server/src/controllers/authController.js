const { verifyCode, getUserByCode } = require('../services/authService');

exports.verifyAccessCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        details: '验证码不能为空' 
      });
    }

    const user = await getUserByCode(code);
    
    if (user) {
      res.json({ 
        success: true,
        userId: user.id
      });
    } else {
      res.status(401).json({ 
        success: false, 
        details: '验证码错误' 
      });
    }
  } catch (error) {
    console.error('验证错误:', error);
    res.status(500).json({ 
      success: false, 
      details: '验证过程发生错误' 
    });
  }
}; 