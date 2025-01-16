const axios = require('axios');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

exports.analyzeWithDeepSeek = async (text) => {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `作为专业的评论分析助手，请对评论进行分析并返回JSON格式结果。要求：

1. 分析整体情感倾向（positive/negative/neutral）和情感强度（0-1）
2. 提供准确的中文翻译
3. 标注原文中的情感表达词组，并提供对应的中文翻译
4. 提取关键主题和观点

返回格式示例：
{
  "sentiment": "positive",
  "score": 0.8,
  "translation": "产品质量很好，但价格太贵了",
  "highlights": {
    "positive": ["excellent quality"],
    "negative": ["too expensive"]
  },
  "translatedHighlights": {
    "positive": ["质量很好"],
    "negative": ["太贵"]
  },
  "keywords": ["quality", "price"],
  "themes": [
    {
      "theme": "产品质量",
      "count": 1,
      "sentiment": "positive"
    }
  ]
}

注意：
1. translatedHighlights 中的词组必须与 translation 中的文本完全匹配
2. highlights 与 translatedHighlights 必须一一对应
3. 翻译要准确自然，符合中文表达习惯`
          },
          {
            role: "user",
            content: text
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
    if (!result.translatedHighlights) {
      result.translatedHighlights = {
        positive: [],
        negative: []
      };
    }

    return result;
  } catch (error) {
    throw new Error(`评论分析失败: ${error.message}`);
  }
}; 