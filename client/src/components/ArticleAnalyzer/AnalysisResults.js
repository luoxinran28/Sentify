import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  TrendingUp as PositiveIcon,
  TrendingFlat as NeutralIcon,
  TrendingDown as NegativeIcon
} from '@mui/icons-material';
import ArticleAnalysisCard from './ArticleAnalysisCard';

const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return <PositiveIcon color="success" />;
    case 'negative':
      return <NegativeIcon color="error" />;
    default:
      return <NeutralIcon color="action" />;
  }
};

export const Overview = ({ results, articles }) => (
  <Accordion 
    defaultExpanded
    elevation={0}
    sx={{ border: 1, borderColor: 'divider' }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">情感分布</Typography>
        <Tooltip title="显示所有内容的情感分布情况" arrow>
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={2}>
        {Object.entries(results.sentimentDistribution).map(([sentiment, count]) => (
          <Grid item xs={12} key={sentiment}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getSentimentIcon(sentiment)}
                {sentiment === 'positive' ? '正面' : sentiment === 'negative' ? '负面' : '中性'}
                ({count}条)
              </Typography>
              <Tooltip 
                title={`占比 ${((count / articles.length) * 100).toFixed(1)}%`}
                placement="right"
                arrow
              >
                <LinearProgress
                  variant="determinate"
                  value={(count / articles.length) * 100}
                  color={sentiment === 'positive' ? 'success' : sentiment === 'negative' ? 'error' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Tooltip>
            </Box>
          </Grid>
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
);

export const ThemeAnalysis = ({ results, articles }) => (
  <Accordion 
    defaultExpanded
    elevation={0}
    sx={{ border: 1, borderColor: 'divider' }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">主题分析</Typography>
        <Tooltip title="显示内容中提到的主要主题及其情感倾向" arrow>
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={2}>
        {results.themes.map(({ theme, count, sentiment }) => (
          <Grid item xs={12} key={theme}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getSentimentIcon(sentiment)}
                {theme} ({count}条)
              </Typography>
              <Tooltip 
                title={`占比 ${((count / articles.length) * 100).toFixed(1)}%`}
                placement="right"
                arrow
              >
                <LinearProgress
                  variant="determinate"
                  value={(count / articles.length) * 100}
                  color={sentiment === 'positive' ? 'success' : sentiment === 'negative' ? 'error' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Tooltip>
            </Box>
          </Grid>
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
);

export { ArticleAnalysisCard };

const AnalysisResults = { Overview, ThemeAnalysis, ArticleAnalysisCard };

export default AnalysisResults; 