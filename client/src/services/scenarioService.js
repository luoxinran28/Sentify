import axios from './axiosInstance';

export const scenarioService = {
  // 获取场景列表
  getScenarios: async (page = 1, signal) => {
    try {
      const response = await axios.get(`/scenarios?page=${page}`, { signal });
      return response.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('获取场景列表失败:', error);
      throw new Error(error.response?.data?.message || '获取场景列表失败');
    }
  },

  // 创建场景
  createScenario: async (data) => {
    try {
      const response = await axios.post('/scenarios', data);
      return response.data;
    } catch (error) {
      console.error('创建场景失败:', error);
      throw new Error(error.response?.data?.message || '创建场景失败');
    }
  },

  // 更新场景
  updateScenario: async (id, data) => {
    try {
      const response = await axios.put(`/scenarios/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('更新场景失败:', error);
      throw new Error(error.response?.data?.message || '更新场景失败');
    }
  },

  // 删除场景
  deleteScenario: async (id) => {
    try {
      const response = await axios.delete(`/scenarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除场景失败:', error);
      throw new Error(error.response?.data?.message || '删除场景失败');
    }
  }
}; 