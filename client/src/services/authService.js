import axios from './axiosInstance';
import { encryptCode } from './axiosInstance';

export const authService = {
  // 用户验证
  verify: async (code) => {
    try {
      const encryptedCode = encryptCode(code);
      const response = await axios.post('/auth/verify', {}, {
        headers: {
          'X-Access-Code': encryptedCode
        }
      });
      
      if (response.data.success) {
        localStorage.setItem('accessCode', encryptedCode);
      }
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('验证码无效');
      }
      console.error('验证失败:', error);
      throw new Error(error.response?.data?.details || '验证失败，请稍后重试');
    }
  },

  // 用户登出
  logout: async () => {
    try {
      const accessCode = localStorage.getItem('accessCode');
      if (!accessCode) {
        throw new Error('未找到验证信息');
      }

      const response = await axios.post('/auth/logout', {}, {
        headers: {
          'X-Access-Code': accessCode
        }
      });
      localStorage.removeItem('accessCode');
      return response.data;
    } catch (error) {
      console.error('登出失败:', error);
      throw new Error(error.response?.data?.details || '登出失败，请稍后重试');
    }
  }
}; 