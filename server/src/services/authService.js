const crypto = require('crypto');

// 验证访问码
exports.verifyCode = async (encryptedCode) => {
  try {
    // 从环境变量获取正确的加密后的访问码
    const validEncryptedCode = process.env.ACCESS_CODE_HASH;
    
    if (!validEncryptedCode) {
      throw new Error('系统未配置访问码');
    }

    // 比较加密后的访问码
    return encryptedCode === validEncryptedCode;
  } catch (error) {
    console.error('验证码验证错误:', error);
    throw error;
  }
}; 