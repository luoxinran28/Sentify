import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp as PositiveIcon,
  TrendingFlat as NeutralIcon,
  TrendingDown as NegativeIcon
} from '@mui/icons-material';

function AnalysisResults({ results }) {
  const { totalComments, sentimentDistribution, keywords, themes, averageSentiment, summary } = results;
  const total = totalComments || 1;

  const getPercentage = (value) => ((value / total) * 100).toFixed(1);

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return <PositiveIcon color="success" />;
      case 'negative': return <NegativeIcon color="error" />;
      default: return <NeutralIcon color="action" />;
    }
  };

  const SummarySection = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSentimentIcon(results.sentiment)}
          分析摘要
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {summary}
        </Typography>
      </CardContent>
    </Card>
  );

  const KeywordAnalysis = () => (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>
        关键词分析
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {keywords.map((keyword, index) => (
          <Chip
            key={index}
            label={keyword}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ 
              fontSize: '14px',
              opacity: 0.9
            }}
          />
        ))}
      </Box>
    </Box>
  );

  const ThemeAnalysis = () => (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>
        主题分析
      </Typography>
      <Grid container spacing={2}>
        {themes.map(({ theme, count, sentiment }) => (
          <Grid item xs={12} key={theme}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getSentimentIcon(sentiment)}
                {theme} ({count}条评论)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(count / totalComments) * 100}
                color={sentiment === 'positive' ? 'success' : sentiment === 'negative' ? 'error' : 'primary'}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const SentimentDistribution = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PositiveIcon color="success" />
          积极评论 ({getPercentage(sentimentDistribution.positive)}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={parseFloat(getPercentage(sentimentDistribution.positive))}
          color="success"
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NeutralIcon color="action" />
          中性评论 ({getPercentage(sentimentDistribution.neutral)}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={parseFloat(getPercentage(sentimentDistribution.neutral))}
          color="primary"
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NegativeIcon color="error" />
          消极评论 ({getPercentage(sentimentDistribution.negative)}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={parseFloat(getPercentage(sentimentDistribution.negative))}
          color="error"
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Grid>
    </Grid>
  );

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        分析结果
      </Typography>

      <SummarySection />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          总评论数：{totalComments}
        </Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        情感分布
      </Typography>

      <SentimentDistribution />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSentimentIcon(averageSentiment > 0.5 ? 'positive' : averageSentiment < -0.5 ? 'negative' : 'neutral')}
          平均情感得分: {averageSentiment}
        </Typography>
      </Box>

      <KeywordAnalysis />
      <ThemeAnalysis />
    </Paper>
  );
}

export default AnalysisResults; 