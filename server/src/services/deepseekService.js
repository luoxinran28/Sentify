const axios = require('axios');
const { COMMENT_ANALYSIS_PROMPT } = require('../prompts/commentAnalysis');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

exports.analyzeWithDeepSeek = async (comments) => {
  try {
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
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    
    // 确保返回结果包含所有必要字段
    result.analyses = result.analyses.map(analysis => ({
      ...analysis,
      translatedHighlights: analysis.translatedHighlights || {
        positive: [],
        negative: []
      }
    }));

    return result;
  } catch (error) {
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