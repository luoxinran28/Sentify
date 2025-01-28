import axios from './axiosInstance';
import { encryptCode } from './axiosInstance';
import { addAccessCodeHeader } from './axiosInstance';

export const authService = {
  // 用户验证
  verify: async (code) => {
    try {
      const encryptedCode = encryptCode(code);
      const response = await axios.post('/auth/verify', {
        code: encryptedCode
      });
      
      if (response.data.success) {
        localStorage.setItem('accessCode', encryptedCode);
      }
      
      return response.data;
    } catch (error) {
      console.error('验证失败:', error);
      throw new Error('验证失败，请稍后重试');
    }
  },

  // 用户登出
  logout: async () => {
    try {
      const response = await axios.post('/auth/logout', null, {
        headers: addAccessCodeHeader()
      });
      localStorage.removeItem('accessCode');
      return response.data;
    } catch (error) {
      console.error('登出失败:', error);
      throw new Error('登出失败，请稍后重试');
    }
  }
}; 