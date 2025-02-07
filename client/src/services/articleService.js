import axios from './axiosInstance';

export const articleService = {
  // 分析文章
  analyzeArticles: async (articles, scenarioId) => {
    try {
      const response = await axios.post(`/articles/${scenarioId}/analyze`, { articles });
      return response.data;
    } catch (error) {
      console.error('分析文章失败:', error);
      throw new Error(error.response?.data?.details || error.message);
    }
  },

  // 获取场景文章
  getScenarioArticles: async (scenarioId, page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `/articles/${scenarioId}?page=${page}&limit=${limit}`
      );
      // 确保返回格式一致
      return response.data;
    } catch (error) {
      console.error('获取场景文章失败:', error);
      throw new Error(error.response?.data?.message || '获取场景文章失败');
    }
  },

  // 清除场景文章
  clearArticles: async (scenarioId) => {
    try {
      const response = await axios.post(`/articles/${scenarioId}/clear`);
      return response.data;
    } catch (error) {
      console.error('清除文章失败:', error);
      throw new Error(error.response?.data?.message || '清除文章失败');
    }
  },

  deleteArticles: async (scenarioId, articleIds) => {
    try {
      const response = await axios.delete(`/articles/${scenarioId}`, {
        data: { articleIds }
      });
      return response.data;
    } catch (error) {
      console.error('删除文章失败:', error);
      throw new Error(error.response?.data?.message || '删除文章失败');
    }
  }
}; 