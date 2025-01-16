const SESSION_DURATION = 30 * 60 * 1000; // 30分钟会话时间

// 检查认证状态
export const checkAuthStatus = () => {
  try {
    const authStatus = localStorage.getItem('auth_status');
    const authTimestamp = localStorage.getItem('auth_timestamp');
    
    if (authStatus === 'verified' && authTimestamp) {
      const now = Date.now();
      const timestamp = parseInt(authTimestamp, 10);
      
      if (now - timestamp < SESSION_DURATION) {
        // 更新时间戳
        localStorage.setItem('auth_timestamp', now.toString());
        return true;
      }
      // 会话过期，清除认证状态
      clearAuthStatus();
    }
    return false;
  } catch (error) {
    console.error('认证状态检查错误:', error);
    return false;
  }
};

// 清除认证状态
export const clearAuthStatus = () => {
  try {
    localStorage.removeItem('auth_status');
    localStorage.removeItem('auth_timestamp');
  } catch (error) {
    console.error('清除认证状态错误:', error);
  }
};

// 设置认证状态
export const setAuthStatus = () => {
  try {
    const now = Date.now();
    localStorage.setItem('auth_status', 'verified');
    localStorage.setItem('auth_timestamp', now.toString());
  } catch (error) {
    console.error('设置认证状态错误:', error);
  }
}; 