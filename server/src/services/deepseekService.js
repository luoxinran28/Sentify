const axios = require('axios');
const { COMMENT_ANALYSIS_PROMPT } = require('../prompts/commentAnalysis');
const db = require('./databaseService');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

exports.analyzeWithDeepSeek = async (comments) => {
  try {
    // 检查是否所有评论都有缓存
    const cachedResults = await Promise.all(
      comments.map(async (comment) => {
        const cached = await db.findAnalysisByContent(comment);
        if (cached) {
          return {
            ...JSON.parse(cached.highlights),
            sentiment: cached.sentiment,
            score: cached.score,
            translation: cached.translation,
            translatedHighlights: JSON.parse(cached.translated_highlights),
            keywords: JSON.parse(cached.keywords)
          };
        }
        return null;
      })
    );

    // 如果所有评论都有缓存，直接返回
    if (cachedResults.every(result => result !== null)) {
      return {
        analyses: cachedResults,
        themes: [], // TODO: 从缓存中计算主题
        overallSentiment: {
          positive: cachedResults.filter(r => r.sentiment === 'positive').length,
          negative: cachedResults.filter(r => r.sentiment === 'negative').length,
          neutral: cachedResults.filter(r => r.sentiment === 'neutral').length
        }
      };
    }

    // 对未缓存的评论调用 DeepSeek API
    const uncachedComments = comments.filter((_, index) => !cachedResults[index]);
    
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
            content: JSON.stringify(uncachedComments)
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

    const result = JSON.parse(response.data.choices[0].message.content);

    // 保存新的分析结果到数据库
    await Promise.all(
      uncachedComments.map((comment, index) => 
        db.saveAnalysis(comment, result.analyses[index])
      )
    );

    // 合并缓存和新分析的结果
    const finalResults = comments.map((_, index) => 
      cachedResults[index] || result.analyses[index - cachedResults.filter(r => r !== null).length]
    );

    return {
      analyses: finalResults,
      themes: result.themes,
      overallSentiment: result.overallSentiment
    };

  } catch (error) {
    console.error('DeepSeek API 错误:', error);
    throw new Error(`评论分析失败: ${error.message}`);
  }
}; 