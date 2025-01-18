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
const createHighlightedText = (text, highlights, options = {}) => {
  const {
    showTranslation = false,
    getTranslatedWord = null,
    indented = false
  } = options;

  // 确保highlights对象及其属性存在
  const safeHighlights = {
    positive: (highlights?.positive || []),
    negative: (highlights?.negative || [])
  };

  if (!highlights || (!safeHighlights.positive.length && !safeHighlights.negative.length)) {
    return <Typography sx={indented ? { pl: 3 } : undefined}>{text}</Typography>;
  }

  const allHighlights = [
    ...safeHighlights.positive.map(word => ({ word, type: 'positive' })),
    ...safeHighlights.negative.map(word => ({ word, type: 'negative' }))
  ].sort((a, b) => {
    const indexA = text.toLowerCase().indexOf(a.word.toLowerCase());
    const indexB = text.toLowerCase().indexOf(b.word.toLowerCase());
    return indexA - indexB;
  });

  let lastIndex = 0;
  const parts = [];

  allHighlights.forEach((highlight, index) => {
    const wordIndex = text.toLowerCase().indexOf(highlight.word.toLowerCase());
    if (wordIndex === -1) return;

    if (wordIndex > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, wordIndex)}
        </span>
      );
    }

    const translatedWord = showTranslation && getTranslatedWord ? 
      getTranslatedWord(highlight) : null;

    const tooltipTitle = translatedWord
      ? `${highlight.type === 'positive' ? '积极表达' : '消极表达'}: ${translatedWord}`
      : highlight.type === 'positive' ? '积极表达' : '消极表达';

    parts.push(
      <Tooltip
        key={`highlight-${index}`}
        title={tooltipTitle}
        arrow
      >
        <Box
          component="span"
          sx={{
            backgroundColor: highlight.type === 'positive' ? 'success.light' : 'error.light',
            px: 0.5,
            borderRadius: 0.5,
            color: 'white',
            cursor: 'help'
          }}
        >
          {text.substr(wordIndex, highlight.word.length)}
        </Box>
      </Tooltip>
    );
    lastIndex = wordIndex + highlight.word.length;
  });

  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <Typography sx={indented ? { pl: 3 } : undefined}>{parts}</Typography>;
};

const HighlightedText = ({ text, highlights, translatedHighlights }) => {
  const getTranslatedWord = (highlight) => {
    if (!translatedHighlights || !translatedHighlights[highlight.type]) return null;
    const index = highlights[highlight.type].indexOf(highlight.word);
    return translatedHighlights[highlight.type][index];
  };

  return createHighlightedText(text, highlights, {
    showTranslation: true,
    getTranslatedWord
  });
};

const TranslatedHighlightedText = ({ text, highlights }) => (
  createHighlightedText(text, highlights, { indented: true })
);

function CommentAnalysisCard({ analysis, originalText }) {
  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return <PositiveIcon color="success" />;
      case 'negative': return <NegativeIcon color="error" />;
      default: return <NeutralIcon color="action" />;
    }
  };

  const getSentimentColor = (score) => {
    if (score >= 0.6) return 'success.main';
    if (score <= 0.4) return 'error.main';
    return 'text.primary';
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getSentimentIcon(analysis.sentiment)}
            <Box component="span" sx={{ color: getSentimentColor(analysis.score) }}>
              情感得分: {analysis.score}
            </Box>
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              原文评论:
            </Typography>
            <HighlightedText 
              text={originalText} 
              highlights={analysis.highlights}
              translatedHighlights={analysis.translatedHighlights}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TranslateIcon fontSize="small" />
              中文翻译:
            </Typography>
            <TranslatedHighlightedText 
              text={analysis.translation} 
              highlights={analysis.translatedHighlights}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            关键词:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {analysis.keywords.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CommentAnalysisCard; 