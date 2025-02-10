import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
  Paper,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Psychology as EmotionalIcon,
  Build as FunctionalIcon,
  Speed as HastyIcon
} from '@mui/icons-material';

const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'emotional':
      return <EmotionalIcon color="primary" />;
    case 'functional':
      return <FunctionalIcon color="secondary" />;
    default:
      return <HastyIcon color="warning" />;
  }
};

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case 'emotional':
      return 'primary';
    case 'functional':
      return 'secondary';
    default:
      return 'warning';
  }
};

const getSentimentText = (sentiment) => {
  switch (sentiment) {
    case 'emotional':
      return '感性';
    case 'functional':
      return '实用';
    default:
      return '敷衍';
  }
};

const SentimentDistribution = ({ results, articles }) => (
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
                {getSentimentText(sentiment)}
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
                  color={getSentimentColor(sentiment)}
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

const ConfidenceDistribution = ({ results }) => {
  // 获取最高置信度的类型
  const getHighestConfidenceType = (distribution) => {
    return Object.entries(distribution).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  return (
    <Accordion 
      defaultExpanded
      elevation={0}
      sx={{ border: 1, borderColor: 'divider' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">置信度分布</Typography>
          <Tooltip title="显示分析结果的置信度分布" arrow>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {results.individualResults.map((result, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  文章 {index + 1}
                  <Chip
                    size="small"
                    label={`主要倾向: ${getSentimentText(getHighestConfidenceType(result.confidenceDistribution))}`}
                    color={getSentimentColor(getHighestConfidenceType(result.confidenceDistribution))}
                  />
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(result.confidenceDistribution).map(([type, value]) => {
                    const isHighest = type === getHighestConfidenceType(result.confidenceDistribution);
                    return (
                      <Chip
                        key={type}
                        label={`${getSentimentText(type)}: ${(value * 100).toFixed()}%`}
                        color={getSentimentColor(type)}
                        variant={isHighest ? "filled" : "outlined"}
                        size="small"
                      />
                    );
                  })}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

const OverviewPage = ({ results, articles }) => {
  return results && articles.length > 0 && articles[0].text !== '' && (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SentimentDistribution
          results={results} 
          articles={articles.map(a => typeof a === 'string' ? a : a.text || '')} 
        />
        <ConfidenceDistribution 
          results={results}
        />
      </Box>
    </Paper>
  );
};

export default OverviewPage; 