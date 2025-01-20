import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp as PositiveIcon,
  TrendingFlat as NeutralIcon,
  TrendingDown as NegativeIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import CommentAnalysisCard from './CommentAnalysisCard';

function AnalysisResults({ results, comments }) {
  const { totalComments, sentimentDistribution, themes, averageSentiment, individualResults } = results;
  const total = totalComments || 1;
  const [expandedSection, setExpandedSection] = useState('overall');

  const getPercentage = (value) => ((value / total) * 100).toFixed(1);

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'positive': return <PositiveIcon color="success" />;
      case 'negative': return <NegativeIcon color="error" />;
      default: return <NeutralIcon color="action" />;
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const OverallAnalysis = () => (
    <Accordion 
      expanded={expandedSection === 'overall'} 
      onChange={handleAccordionChange('overall')}
      elevation={0}
      sx={{ border: 1, borderColor: 'divider' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">整体分析</Typography>
          <Tooltip title="显示评论的整体情感分布和平均得分" arrow>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            总评论数：{totalComments}
          </Typography>
          <Typography variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getSentimentIcon(averageSentiment > 0.5 ? 'positive' : averageSentiment < -0.5 ? 'negative' : 'neutral')}
            平均情感得分: {averageSentiment}
          </Typography>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          情感分布
        </Typography>

        <Grid container spacing={2}>
          {[
            { type: 'positive', icon: <PositiveIcon color="success" />, color: 'success' },
            { type: 'neutral', icon: <NeutralIcon color="action" />, color: 'primary' },
            { type: 'negative', icon: <NegativeIcon color="error" />, color: 'error' }
          ].map(({ type, icon, color }) => (
            <Grid item xs={12} key={type}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {icon}
                  {type.charAt(0).toUpperCase() + type.slice(1)}评论 ({getPercentage(sentimentDistribution[type])}%)
                </Typography>
                <Tooltip 
                  title={`${sentimentDistribution[type]}条评论`}
                  placement="right"
                  arrow
                >
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(getPercentage(sentimentDistribution[type]))}
                    color={color}
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

  const ThemeAnalysis = () => (
    <Accordion 
      expanded={expandedSection === 'themes'} 
      onChange={handleAccordionChange('themes')}
      elevation={0}
      sx={{ border: 1, borderColor: 'divider' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">主题分析</Typography>
          <Tooltip title="显示评论中提到的主要主题及其情感倾向" arrow>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {themes.map(({ theme, count, sentiment }) => (
            <Grid item xs={12} key={theme}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getSentimentIcon(sentiment)}
                  {theme} ({count}条评论)
                </Typography>
                <Tooltip 
                  title={`占比 ${((count / totalComments) * 100).toFixed(1)}%`}
                  placement="right"
                  arrow
                >
                  <LinearProgress
                    variant="determinate"
                    value={(count / totalComments) * 100}
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

  const IndividualAnalyses = () => (
    <Accordion 
      expanded={expandedSection === 'individual'} 
      onChange={handleAccordionChange('individual')}
      elevation={0}
      sx={{ border: 1, borderColor: 'divider' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">单条评论分析</Typography>
          <Tooltip title="显示每条评论的详细分析结果" arrow>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {individualResults.map((result, index) => (
            <CommentAnalysisCard
              key={index}
              analysis={result}
              originalText={comments[index].text}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Stack spacing={2}>
      <OverallAnalysis />
      <ThemeAnalysis />
      <IndividualAnalyses />
    </Stack>
  );
}

export default AnalysisResults; 