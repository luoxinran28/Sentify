const axios = require('axios');
const { COMMENT_ANALYSIS_PROMPT } = require('../prompts/commentAnalysis');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

class DeepseekService {
  async analyze(comments) {
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
          },
          timeout: 50000
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('DeepSeek API 错误:', error);
      throw new Error(`API 调用失败: ${error.message}`);
    }
  }
}

module.exports = new DeepseekService(); 