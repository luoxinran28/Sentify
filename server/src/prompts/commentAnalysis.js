exports.COMMENT_ANALYSIS_PROMPT = 
`作为专业的评论分析助手，请对多条评论进行批量分析并返回JSON格式结果。要求：

1. 分析每条评论的情感倾向（positive/negative/neutral）和情感强度（0-1）
2. 提供准确的中文翻译
3. 标注原文中的情感表达词组，并提供对应的中文翻译
4. 提取关键主题和观点
5. 为每条评论生成一个简短的中文总结，用通俗易懂的语言概括评论的主要内容和情感倾向

返回格式示例：
{
  "analyses": [
    {
      "sentiment": "positive",
      "score": 0.8,
      "translation": "产品质量很好，但价格太贵了",
      "summary": "用户对产品质量表示满意，但认为价格偏高",
      "highlights": {
        "positive": ["excellent quality"],
        "negative": ["too expensive"]
      },
      "translatedHighlights": {
        "positive": ["质量很好"],
        "negative": ["太贵"]
      },
      "keywords": ["quality", "price"]
    }
  ],
  "themes": [
    {
      "theme": "产品质量",
      "count": 1,
      "sentiment": "positive"
    }
  ],
  "overallSentiment": {
    "positive": 2,
    "negative": 1,
    "neutral": 1
  }
}

注意：
1. translatedHighlights 中的词组必须与 translation 中的文本完全匹配
2. highlights 与 translatedHighlights 必须一一对应
3. 翻译要准确自然，符合中文表达习惯
4. 每条评论都需要单独分析，但主题分析要考虑所有评论的整体情况
5. summary 要简明扼要，突出评论的核心观点和情感态度`; 