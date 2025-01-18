const axios = require('axios');
const { COMMENT_ANALYSIS_PROMPT } = require('../prompts/commentAnalysis');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MAX_COMMENTS = 20;
const MAX_COMMENT_LENGTH = 1000;

class DeepseekService {
  async analyze(comments) {
    try {
      // 验证评论数量和长度
      if (comments.length > MAX_COMMENTS) {
        throw new Error(`评论数量超过限制 (最大${MAX_COMMENTS}条)`);
      }

      const tooLongComments = comments.filter(c => c.length > MAX_COMMENT_LENGTH);
      if (tooLongComments.length > 0) {
        throw new Error(`评论长度超过限制 (最大${MAX_COMMENT_LENGTH}字符)`);
      }

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
          timeout: 120000 // 增加到120秒
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      
      // 验证和格式化响应数据
      return this._validateAndFormatResponse(result);
    } catch (error) {
      console.error('DeepSeek API 错误:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('分析超时，请减少评论数量或长度后重试');
      }
      throw new Error(`API 调用失败: ${error.message}`);
    }
  }

  _validateAndFormatResponse(result) {
    if (!result || !Array.isArray(result.analyses)) {
      throw new Error('API 返回数据格式错误');
    }

    // 格式化每个分析结果
    result.analyses = result.analyses.map(analysis => ({
      sentiment: analysis.sentiment || 'neutral',
      score: analysis.score || 0.5,
      translation: analysis.translation || '',
      highlights: {
        positive: Array.isArray(analysis.highlights?.positive) ? analysis.highlights.positive : [],
        negative: Array.isArray(analysis.highlights?.negative) ? analysis.highlights.negative : []
      },
      translatedHighlights: {
        positive: Array.isArray(analysis.translatedHighlights?.positive) ? analysis.translatedHighlights.positive : [],
        negative: Array.isArray(analysis.translatedHighlights?.negative) ? analysis.translatedHighlights.negative : []
      },
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      summary: analysis.summary || '暂无评论总结'
    }));

    // 确保主题分析存在
    result.themes = Array.isArray(result.themes) ? result.themes : [];

    // 确保情感分布存在
    result.overallSentiment = result.overallSentiment || {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    return result;
  }
}

module.exports = new DeepseekService(); 