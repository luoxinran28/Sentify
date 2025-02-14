import axios from './axiosInstance';

export const articleService = {
  // 分析文章
  analyzeArticles: async (articles, scenarioId) => {
    try {
      const response = await axios.post(`/articles/${scenarioId}/analyze`, { articles });
      return {
        totalArticles: response.data.totalArticles,
        sentimentDistribution: response.data.sentimentDistribution,
        resultsAttributes: response.data.resultsAttributes,
        individualResults: response.data.individualResults.map(result => ({
          id: result.id,
          sentiment: result.sentiment,
          translatedSentiment: result.translatedSentiment,
          confidence: result.confidence,
          confidenceDistribution: result.confidenceDistribution,
          translation: result.translation,
          highlights: result.highlights,
          translatedHighlights: result.translatedHighlights,
          reasoning: result.reasoning,
          brief: result.brief
        }))
      };
    } catch (error) {
      console.error('分析文章失败:', error);
      throw new Error(error.response?.data?.details || error.message);
    }
  },

  // 获取场景文章列表（基本信息）
  listArticles: async (scenarioId, page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `/scenarios/${scenarioId}/articles?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw new Error(error.response?.data?.message || '获取文章列表失败');
    }
  },

  // 获取文章及其分析结果
  getArticlesWithAnalysis: async (scenarioId, page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `/articles/${scenarioId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('获取文章分析结果失败:', error);
      throw new Error(error.response?.data?.message || '获取文章分析结果失败');
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

  // 删除选中的文章
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