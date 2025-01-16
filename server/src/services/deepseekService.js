const axios = require('axios');
const { COMMENT_ANALYSIS_PROMPT } = require('../prompts/commentAnalysis');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

exports.analyzeWithDeepSeek = async (comments) => {
  try {
    // 创建取消令牌
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    // 设置超时定时器
    const timeout = setTimeout(() => {
      source.cancel('请求超时');
    }, 50000); // 50秒超时

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: COMMENT_ANALYSIS_PROMPT
          },
          {
            role: "user",
            content: JSON.stringify(comments)
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 50000, // 50秒超时
        cancelToken: source.token
      }
    );

    // 清除超时定时器
    clearTimeout(timeout);

    const result = JSON.parse(response.data.choices[0].message.content);
    
    result.analyses = result.analyses.map(analysis => ({
      ...analysis,
      translatedHighlights: analysis.translatedHighlights || {
        positive: [],
        negative: []
      }
    }));

    return result;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw new Error('请求超时，请稍后重试');
    }
    
    if (error.response) {
      console.error('DeepSeek API 错误响应:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('DeepSeek API 请求失败:', error.message);
    }
    throw new Error(`评论分析失败: ${error.message}`);
  }
}; 