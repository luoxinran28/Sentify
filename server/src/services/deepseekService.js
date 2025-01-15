const axios = require('axios');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

exports.analyzeWithDeepSeek = async (text) => {
  try {
    console.log('开始调用 DeepSeek API...');
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `你是一个专业的情感分析助手。请分析以下评论并返回JSON格式结果，包含以下字段：
- sentiment: 整体情感(positive/negative/neutral)
- score: 情感得分(0.0-1.0)
- keywords: 关键词数组
- themes: 主题数组，每个主题包含theme(主题名称)、count(出现次数)、sentiment(主题情感倾向)
- summary: 整体分析总结

示例格式：
{
  "sentiment": "positive",
  "score": 0.8,
  "keywords": ["优质", "服务好", "价格合理"],
  "themes": [
    {
      "theme": "服务质量",
      "count": 2,
      "sentiment": "positive"
    }
  ],
  "summary": "整体评价积极，主要赞扬服务质量..."
}`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('DeepSeek API 响应:', response.data.choices[0].message);

    const result = JSON.parse(response.data.choices[0].message.content);
    console.log('解析后的结果:', result);
    
    return result;
  } catch (error) {
    console.error('DeepSeek API 错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`DeepSeek API 调用失败: ${error.message}`);
  }
}; 