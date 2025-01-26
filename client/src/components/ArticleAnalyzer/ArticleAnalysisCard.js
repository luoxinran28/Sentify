import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as PositiveIcon,
  TrendingFlat as NeutralIcon,
  TrendingDown as NegativeIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';

// 抽取通用的高亮文本处理逻辑
const createHighlightedText = (text, highlights, translatedHighlights) => {
  if (!highlights || !translatedHighlights) return text;

  const allHighlights = [
    ...Object.entries(highlights).flatMap(([type, phrases]) =>
      phrases.map(phrase => ({ phrase, type }))
    ),
    ...Object.entries(translatedHighlights).flatMap(([type, phrases]) =>
      phrases.map(phrase => ({ phrase, type }))
    )
  ];

  // 按长度降序排序，确保较长的短语先被处理
  allHighlights.sort((a, b) => b.phrase.length - a.phrase.length);

  let result = text;
  let placeholders = [];

  // 使用占位符替换高亮文本
  allHighlights.forEach((highlight, index) => {
    const placeholder = `__HIGHLIGHT_${index}__`;
    const regex = new RegExp(highlight.phrase, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, placeholder);
      placeholders.push({
        placeholder,
        text: highlight.phrase,
        type: highlight.type
      });
    }
  });

  // 将占位符替换为带样式的文本
  placeholders.forEach(({ placeholder, text, type }) => {
    const color = type === 'positive' ? '#4caf50' : type === 'negative' ? '#f44336' : '#2196f3';
    const styledText = `<span style="color: ${color}; font-weight: 500;">${text}</span>`;
    result = result.replace(placeholder, styledText);
  });

  return <div dangerouslySetInnerHTML={{ __html: result }} />;
};

function ArticleAnalysisCard({ result, article, index }) {
  const {
    sentiment,
    score,
    translation,
    summary,
    highlights,
    translatedHighlights
  } = result;

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return <PositiveIcon color="success" />;
      case 'negative':
        return <NegativeIcon color="error" />;
      default:
        return <NeutralIcon color="action" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'primary';
    }
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
            <Typography variant="body1">
              {createHighlightedText(article, highlights)}
            </Typography>
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
            <Typography variant="body1">
              {createHighlightedText(translation, translatedHighlights)}
            </Typography>
          </Box>

          <Divider />

          {/* 情感分析 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={getSentimentIcon()}
              label={`情感得分: ${(score * 100).toFixed()}%`}
              color={getSentimentColor()}
              variant="outlined"
            />
          </Box>

          {/* 摘要 */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              摘要
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {summary}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ArticleAnalysisCard; 