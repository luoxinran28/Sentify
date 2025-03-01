const axios = require('axios');
const databaseService = require('./database/databaseService');
const scenarioService = require('./scenarioService');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MAX_ARTICLES = 50;
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
      
      // 获取场景的情感类型
      const scenarioSentiments = await scenarioService.getScenarioSentiments(scenarioId, userId);
      
      // 如果没有情感类型，使用默认的三种
      const sentimentCodes = scenarioSentiments.length > 0 
        ? scenarioSentiments.map(s => s.code)
        : ['hasty', 'emotional', 'functional'];
      
      // 构建情感类型映射，用于翻译
      const sentimentTranslations = {};
      scenarioSentiments.forEach(s => {
        sentimentTranslations[s.code] = s.nameZh;
      });
      
      // 如果没有自定义情感类型，使用默认翻译
      if (Object.keys(sentimentTranslations).length === 0) {
        sentimentTranslations.hasty = "敷衍";
        sentimentTranslations.emotional = "感性";
        sentimentTranslations.functional = "实用";
      }

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
              content: JSON.stringify({
                articles,
                availableSentiments: sentimentCodes
              })
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
      return this._validateAndFormatResponse(result, sentimentCodes, sentimentTranslations);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('分析超时，请减少文章数量或长度后重试');
      }
      throw new Error(`DeepSeek API 调用失败: ${error.message}`);
    }
  }

  _validateAndFormatResponse(result, sentimentCodes, sentimentTranslations) {
    if (!result || !result.individualResults || !Array.isArray(result.individualResults)) {
        console.error('DeepSeek API 返回数据结构错误:', result);
        throw new Error('DeepSeek API 返回数据结构错误');
    }

    // 格式化每个分析结果
    const analyses = result.individualResults.map(analysis => {
      
      // 确保返回的情感类型在允许的范围内
      if (!sentimentCodes.includes(analysis.sentiment)) {
        console.warn(`API返回了未知的情感类型: ${analysis.sentiment}，使用默认类型: ${sentimentCodes[0]}`);
        analysis.sentiment = sentimentCodes[0];
      }

      // 构建置信度分布对象
      const confidenceDistribution = {};
      sentimentCodes.forEach(code => {
        confidenceDistribution[code] = parseFloat(analysis.confidenceDistribution?.[code]) || 0;
      });
      
      // 构建高亮对象
      const highlights = {};
      const translatedHighlights = {};
      sentimentCodes.forEach(code => {
        highlights[code] = Array.isArray(analysis.highlights?.[code]) ? analysis.highlights[code] : [];
        translatedHighlights[code] = Array.isArray(analysis.translatedHighlights?.[code]) ? analysis.translatedHighlights[code] : [];
      });

      // 确保数据格式正确
      return {
        sentiment: analysis.sentiment || sentimentCodes[0],
        translatedSentiment: sentimentTranslations[analysis.sentiment] || analysis.translatedSentiment || '未知',
        confidence: parseFloat(analysis.confidence) || 0,
        confidenceDistribution,
        translation: analysis.translation || '',
        highlights,
        translatedHighlights,
        reasoning: analysis.reasoning || '暂无推理过程',
        brief: analysis.brief || '暂无总结',
        replySuggestion: analysis.replySuggestion || '暂无回复建议'
      };
    });

    // 统计每种情感类型的出现次数
    const overallSentiment = analyses.reduce((acc, analysis) => {
      acc[analysis.sentiment] = (acc[analysis.sentiment] || 0) + 1;
      return acc;
    }, {});
    
    // 确保所有情感类型都有计数，即使是0
    sentimentCodes.forEach(code => {
      if (overallSentiment[code] === undefined) {
        overallSentiment[code] = 0;
      }
    });

    return {
      analyses,
      overallSentiment,
      resultsAttributes: {
        sentimentTranslation: sentimentTranslations
      }
    };
  }

  _getHighestConfidence(confidence) {
    if (!confidence) return 0;
    const values = Object.values(confidence).map(Number);
    return Math.max(...values);
  }

  _calculateOverallSentiment(analyses) {
    const distribution = {};
    
    // 初始化所有情感类型的计数为0
    if (analyses.length > 0 && analyses[0].confidenceDistribution) {
      Object.keys(analyses[0].confidenceDistribution).forEach(type => {
        distribution[type] = 0;
      });
    }

    analyses.forEach(analysis => {
      if (analysis.sentiment) {
        distribution[analysis.sentiment] = (distribution[analysis.sentiment] || 0) + 1;
      }
    });

    return distribution;
  }
}

module.exports = new DeepseekService(); 