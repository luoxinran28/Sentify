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

  // 获取场景文章
  getScenarioArticles: async (scenarioId, page = 1, limit = 20) => {
    try {
      const response = await axios.get(
        `/articles/${scenarioId}?page=${page}&limit=${limit}`
      );
      
      // 处理分析结果数据
      if (response.data.results) {
        return {
          articles: response.data.articles,
          results: {
            totalArticles: response.data.results.totalArticles,
            sentimentDistribution: response.data.results.sentimentDistribution,
            resultsAttributes: response.data.results.resultsAttributes,
            individualResults: response.data.results.individualResults.map(result => ({
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
          }
        };
      }
      
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

  // 删除文章
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