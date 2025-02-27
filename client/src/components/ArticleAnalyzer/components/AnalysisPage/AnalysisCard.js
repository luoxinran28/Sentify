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
  Translate as TranslateIcon
} from '@mui/icons-material';

// 抽取通用的高亮文本处理逻辑
const createHighlightedText = (text, highlights, options = {}) => {
  const {
    showTranslation = false,
    translatedHighlights = null,
    indented = false
  } = options;

  // 确保highlights对象及其属性存在
  const safeHighlights = {
    hasty: (highlights?.hasty || []),
    emotional: (highlights?.emotional || []),
    functional: (highlights?.functional || [])
  };

  if (!highlights || (!safeHighlights.hasty.length && !safeHighlights.emotional.length && !safeHighlights.functional.length)) {
    return <Typography sx={indented ? { pl: 3 } : undefined}>{text}</Typography>;
  }

  // 创建翻译查找表
  const translationMap = {};
  if (showTranslation && translatedHighlights) {
    Object.entries(translatedHighlights).forEach(([type, words]) => {
      words.forEach((word, index) => {
        translationMap[safeHighlights[type][index]] = word;
      });
    });
  }

  const allHighlights = [
    ...safeHighlights.hasty.map(word => ({ word, type: 'hasty' })),
    ...safeHighlights.emotional.map(word => ({ word, type: 'emotional' })),
    ...safeHighlights.functional.map(word => ({ word, type: 'functional' }))
  ].sort((a, b) => {
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

    // 添加高亮文本
    const highlightedWord = text.substring(wordIndex, wordIndex + word.length);
    const highlightColor = type === 'emotional' ? '#e3f2fd' : type === 'functional' ? '#f3e5f5' : '#fff3e0';
    const typeText = type === 'emotional' ? '感性' : type === 'functional' ? '实用' : '敷衍';
    const translation = translationMap[word];
    const tooltipContent = showTranslation && translation ? 
      `${typeText}表达: ${translation}` : 
      `${typeText}表达`;

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

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'emotional':
        return <EmotionalIcon color="primary" />;
      case 'functional':
        return <FunctionalIcon color="secondary" />;
      default:
        return <HastyIcon color="warning" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'emotional':
        return 'primary.main';
      case 'functional':
        return 'secondary.main';
      default:
        return 'warning.main';
    }
  };

  // 获取最高置信度的类型
  const getHighestConfidenceType = (distribution) => {
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
              translatedHighlights: translatedHighlights
            })}
          </Box>

          <Divider />

          {/* 翻译 */}
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
            {createHighlightedText(translation, translatedHighlights)}
          </Box>

          <Divider />

          {/* 情感分析 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={getSentimentIcon()}
                label={`${translatedSentiment} (${(confidence * 100).toFixed()}%)`}
                color={sentiment === 'emotional' ? 'primary' : sentiment === 'functional' ? 'secondary' : 'warning'}
                variant="outlined"
              />
            </Box>
            
            {/* 置信度分布 */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                置信度分布
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(confidenceDistribution).map(([type, value]) => {
                  const isHighest = type === getHighestConfidenceType(confidenceDistribution);
                  return (
                    <Chip
                      key={type}
                      label={`${type === 'emotional' ? '感性' : type === 'functional' ? '实用' : '敷衍'}: ${(value * 100).toFixed()}%`}
                      color={type === 'emotional' ? 'primary' : type === 'functional' ? 'secondary' : 'warning'}
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