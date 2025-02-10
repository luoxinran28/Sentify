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
          timeout: 120000
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      
      return this._validateAndFormatResponse(result);
    } catch (error) {
      console.error('DeepSeek API 错误:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('分析超时，请减少文章数量或长度后重试');
      }
      throw new Error(`API 调用失败: ${error.message}`);
    }
  }

  _validateAndFormatResponse(result) {
    if (!result || !result.individualResults || !Array.isArray(result.individualResults)) {
      throw new Error('API 返回数据格式错误');
    }

    // 格式化每个分析结果
    const analyses = result.individualResults.map(analysis => {
      // 验证必要字段
      if (!analysis.sentiment || !analysis.confidence || !analysis.translation) {
        throw new Error('API 返回的分析结果缺少必要字段');
      }

      return {
        sentiment: analysis.sentiment || 'hasty',
        translatedSentiment: analysis.translatedSentiment || '敷衍',
        score: this._getHighestConfidence(analysis.confidence),
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
        confidence: analysis.confidence || {
          hasty: 0,
          emotional: 0,
          functional: 0
        },
        reasoning: analysis.reasoning || '暂无推理过程',
        brief: analysis.brief || '暂无总结'
      };
    });

    // 计算整体情感分布
    const overallSentiment = this._calculateOverallSentiment(analyses);

    return {
      analyses,
      overallSentiment,
      resultsAttributes: result.resultsAttributes || {
        sentimentTranslation: {
          hasty: "敷衍",
          emotional: "感性",
          functional: "实用"
        }
      }
    };
  }

  _getHighestConfidence(confidence) {
    if (!confidence) return 0.5;
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