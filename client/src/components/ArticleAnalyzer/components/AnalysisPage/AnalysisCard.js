import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Psychology as EmotionalIcon,
  Build as FunctionalIcon,
  Speed as HastyIcon,
  Translate as TranslateIcon,
  EmojiEmotions as DefaultIcon,
  Nature as EnvironmentIcon,
  HighQuality as QualityIcon,
  Block as SmearIcon
} from '@mui/icons-material';

// 抽取通用的高亮文本处理逻辑
const createHighlightedText = (text, highlights, options = {}) => {
  const {
    showTranslation = false,
    translatedHighlights = null,
    indented = false,
    sentimentTranslations = {}
  } = options;

  // 确保highlights对象存在
  if (!highlights) return <Typography sx={indented ? { pl: 3 } : undefined}>{text}</Typography>;

  // 获取所有情感类型
  const sentimentTypes = Object.keys(highlights);
  
  // 如果没有高亮，直接返回原文
  if (sentimentTypes.length === 0 || sentimentTypes.every(type => !highlights[type] || !highlights[type].length)) {
    return <Typography sx={indented ? { pl: 3 } : undefined}>{text}</Typography>;
  }

  // 创建翻译查找表
  const translationMap = {};
  if (showTranslation && translatedHighlights) {
    Object.entries(translatedHighlights).forEach(([type, words]) => {
      if (Array.isArray(words) && Array.isArray(highlights[type])) {
        words.forEach((word, index) => {
          if (index < highlights[type].length) {
            translationMap[highlights[type][index]] = word;
          }
        });
      }
    });
  }

  // 收集所有高亮词
  const allHighlights = [];
  Object.entries(highlights).forEach(([type, words]) => {
    if (Array.isArray(words)) {
      words.forEach(word => {
        allHighlights.push({ word, type });
      });
    }
  });
  
  // 按在文本中的位置排序
  allHighlights.sort((a, b) => {
    const indexA = text.toLowerCase().indexOf(a.word.toLowerCase());
    const indexB = text.toLowerCase().indexOf(b.word.toLowerCase());
    return indexA - indexB;
  });

  let lastIndex = 0;
  const parts = [];

  allHighlights.forEach(({ word, type }, index) => {
    const wordIndex = text.toLowerCase().indexOf(word.toLowerCase(), lastIndex);
    if (wordIndex === -1) return;

    // 添加未高亮的文本
    if (wordIndex > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, wordIndex)}
        </span>
      );
    }

    // 为不同情感类型设置不同的高亮颜色
    let highlightColor;
    switch (type) {
      case 'emotional':
        highlightColor = '#e3f2fd'; // 浅蓝色
        break;
      case 'functional':
        highlightColor = '#f3e5f5'; // 浅紫色
        break;
      case 'hasty':
        highlightColor = '#fff3e0'; // 浅橙色
        break;
      case 'environment':
        highlightColor = '#e8f5e9'; // 浅绿色
        break;
      case 'quality':
        highlightColor = '#e1f5fe'; // 浅天蓝色
        break;
      case 'smear':
        highlightColor = '#ffebee'; // 浅红色
        break;
      default:
        highlightColor = '#f5f5f5'; // 浅灰色，用于其他情感类型
    }

    // 获取情感类型的翻译名称
    const typeText = sentimentTranslations[type] || type;
    
    // 获取高亮词的翻译
    const translation = translationMap[word];
    const tooltipContent = showTranslation && translation ? 
      `${typeText}表达: ${translation}` : 
      `${typeText}表达`;

    // 添加高亮文本
    const highlightedWord = text.substring(wordIndex, wordIndex + word.length);
    parts.push(
      <Tooltip key={`highlight-${index}`} title={tooltipContent} arrow>
        <span style={{ backgroundColor: highlightColor }}>
          {highlightedWord}
        </span>
      </Tooltip>
    );

    lastIndex = wordIndex + word.length;
  });

  // 添加剩余的未高亮文本
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return (
    <Typography sx={indented ? { pl: 3 } : undefined}>
      {parts}
    </Typography>
  );
};

const AnalysisCard = ({ result, article, index }) => {
  const {
    sentiment,
    translatedSentiment,
    confidence,
    confidenceDistribution,
    translation,
    highlights,
    translatedHighlights,
    reasoning,
    brief,
    replySuggestion
  } = result;

  // 从结果中获取情感翻译映射
  const sentimentTranslations = result.sentimentTranslations || {};

  const getSentimentIcon = (sentimentType) => {
    switch (sentimentType) {
      case 'emotional':
        return <EmotionalIcon color="primary" />;
      case 'functional':
        return <FunctionalIcon color="secondary" />;
      case 'hasty':
        return <HastyIcon color="warning" />;
      case 'environment':
        return <EnvironmentIcon color="success" />;
      case 'quality':
        return <QualityIcon color="info" />;
      case 'smear':
        return <SmearIcon color="error" />;
      default:
        return <DefaultIcon />;
    }
  };

  const getSentimentColor = (sentimentType) => {
    switch (sentimentType) {
      case 'emotional':
        return 'primary';
      case 'functional':
        return 'secondary';
      case 'hasty':
        return 'warning';
      case 'environment':
        return 'success';
      case 'quality':
        return 'info';
      case 'smear':
        return 'error';
      default:
        return 'default';
    }
  };

  // 获取最高置信度的类型
  const getHighestConfidenceType = (distribution) => {
    if (!distribution || Object.keys(distribution).length === 0) return '';
    return Object.entries(distribution).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 原文 */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              原文 {index}
            </Typography>
            {createHighlightedText(article, highlights, { 
              showTranslation: true,
              translatedHighlights: translatedHighlights,
              sentimentTranslations
            })}
          </Box>

          <Divider />

          {/* 翻译 - 仅当翻译与原文不同时显示 */}
          {(article !== translation && translation !== '') && (
            <>
              <Box>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <TranslateIcon fontSize="small" />
                  翻译
                </Typography>
                {createHighlightedText(translation, translatedHighlights, { sentimentTranslations })}
              </Box>

              <Divider />
            </>
          )}

          {/* 情感分析 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={getSentimentIcon(sentiment)}
                label={`${translatedSentiment} (${(confidence * 100).toFixed()}%)`}
                color={getSentimentColor(sentiment)}
                variant="outlined"
              />
            </Box>
            
            {/* 置信度分布 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                置信度分布
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {confidenceDistribution && Object.entries(confidenceDistribution).map(([type, value]) => {
                  const isHighest = type === getHighestConfidenceType(confidenceDistribution);
                  return (
                    <Chip
                      key={type}
                      label={`${sentimentTranslations[type] || type}: ${(value * 100).toFixed()}%`}
                      color={getSentimentColor(type)}
                      variant={isHighest ? "filled" : "outlined"}
                      size="small"
                    />
                  );
                })}
              </Box>
            </Paper>

            {/* 推理过程 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                推理过程
              </Typography>
              <Typography variant="body2">
                {reasoning}
              </Typography>
            </Paper>

            {/* 简短总结 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                简短总结
              </Typography>
              <Typography variant="body2">
                {brief}
              </Typography>
            </Paper>

            {/* 回复建议 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                回复建议
              </Typography>
              <Typography variant="body2">
                {replySuggestion}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnalysisCard; 