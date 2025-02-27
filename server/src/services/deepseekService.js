const axios = require('axios');
const databaseService = require('./database/databaseService');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MAX_ARTICLES = 20;
const MAX_ARTICLE_LENGTH = 1000;

class DeepseekService {
  async analyze(articles, scenarioId, userId) {
    try {
      // 验证文章数量和长度
      if (articles.length > MAX_ARTICLES) {
        throw new Error(`文章数量超过限制 (最大${MAX_ARTICLES}条)`);
      }

      const tooLongArticles = articles.filter(a => a.length > MAX_ARTICLE_LENGTH);
      if (tooLongArticles.length > 0) {
        throw new Error(`文章长度超过限制 (最大${MAX_ARTICLE_LENGTH}字符)`);
      }

      // 从数据库获取场景的prompt
      const prompt = await databaseService.getScenarioPrompt(scenarioId, userId);

      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: prompt
            },
            {
              role: "user",
              content: JSON.stringify(articles)
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
          timeout: 180000
        }
      );

      // 增强错误处理
      if (!response.data?.choices?.[0]?.message?.content) {
        console.error('DeepSeek API返回内容为空，原始响应:', JSON.stringify(response.data));
        throw new Error('API 返回数据为空');
      }

      let result;
      try {
        result = JSON.parse(response.data.choices[0].message.content);
        console.log('DeepSeek API 返回结果:', result);
      } catch (error) {
        console.error('API返回内容解析失败:', response.data.choices[0].message.content);
        throw new Error('API 返回数据格式错误');
      }
      return this._validateAndFormatResponse(result);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('分析超时，请减少文章数量或长度后重试');
      }
      throw new Error(`DeepSeek API 调用失败: ${error.message}`);
    }
  }

  _validateAndFormatResponse(result) {
    if (!result || !result.individualResults || !Array.isArray(result.individualResults)) {
        console.error('DeepSeek API 返回数据结构错误:', result);
        throw new Error('DeepSeek API 返回数据结构错误');
    }

    // 格式化每个分析结果
    const analyses = result.individualResults.map(analysis => {
      // 验证必要字段
      if (!analysis.sentiment || !analysis.confidence || !analysis.translation) {
        throw new Error('API 返回的分析结果缺少必要字段');
      }

      // 确保数据格式正确
      return {
        sentiment: analysis.sentiment || 'hasty',
        translatedSentiment: analysis.translatedSentiment || '敷衍',
        confidence: parseFloat(analysis.confidence) || 0,
        confidenceDistribution: {
          hasty: parseFloat(analysis.confidenceDistribution?.hasty) || 0,
          emotional: parseFloat(analysis.confidenceDistribution?.emotional) || 0,
          functional: parseFloat(analysis.confidenceDistribution?.functional) || 0
        },
        translation: analysis.translation || '',
        highlights: {
          hasty: Array.isArray(analysis.highlights?.hasty) ? analysis.highlights.hasty : [],
          emotional: Array.isArray(analysis.highlights?.emotional) ? analysis.highlights.emotional : [],
          functional: Array.isArray(analysis.highlights?.functional) ? analysis.highlights.functional : []
        },
        translatedHighlights: {
          hasty: Array.isArray(analysis.translatedHighlights?.hasty) ? analysis.translatedHighlights.hasty : [],
          emotional: Array.isArray(analysis.translatedHighlights?.emotional) ? analysis.translatedHighlights.emotional : [],
          functional: Array.isArray(analysis.translatedHighlights?.functional) ? analysis.translatedHighlights.functional : []
        },
        reasoning: analysis.reasoning || '暂无推理过程',
        brief: analysis.brief || '暂无总结',
        replySuggestion: analysis.replySuggestion || '暂无回复建议'
      };
    });

    // 统计每种情感类型的出现次数
    // 使用reduce方法遍历分析结果数组
    // acc为累加器对象,初始值包含三种情感类型且计数都为0
    // 每次遍历一个analysis时,将对应情感类型的计数加1
    const overallSentiment = analyses.reduce((acc, analysis) => {
      acc[analysis.sentiment] = (acc[analysis.sentiment] || 0) + 1;
      return acc;
    }, {
      hasty: 0,      // 敷衍型情感计数
      emotional: 0,   // 感性型情感计数
      functional: 0   // 实用型情感计数
    });

    return {
      analyses,
      overallSentiment,
      resultsAttributes: {
        sentimentTranslation: {
          hasty: "敷衍",
          emotional: "感性", 
          functional: "实用"
        }
      }
    };
  }

  _getHighestConfidence(confidence) {
    if (!confidence) return 0;
    const values = Object.values(confidence).map(Number);
    return Math.max(...values);
  }

  _calculateOverallSentiment(analyses) {
    const distribution = {
      hasty: 0,
      emotional: 0,
      functional: 0
    };

    analyses.forEach(analysis => {
      if (analysis.sentiment) {
        distribution[analysis.sentiment]++;
      }
    });

    return distribution;
  }
}

module.exports = new DeepseekService(); 