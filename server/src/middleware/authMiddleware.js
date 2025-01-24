const { getUserById } = require('../services/userService');

exports.authenticateUser = async (req, res, next) => {
  try {
    // 从请求头获取用户ID
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        error: '未授权访问',
        details: '请先登录' 
      });
    }

    // 获取用户信息
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ 
        error: '未授权访问',
        details: '用户不存在' 
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ 
      error: '认证失败',
      details: error.message 
    });
  }
}; 