import React from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Grid
} from '@mui/material';

function AnalysisResults({ results }) {
  const { totalComments, sentimentDistribution } = results;
  const total = totalComments || 1;

  const getPercentage = (value) => ((value / total) * 100).toFixed(1);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        分析结果
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          总评论数：{totalComments}
        </Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        情感分布
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>
            积极评论 ({getPercentage(sentimentDistribution.positive)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={parseFloat(getPercentage(sentimentDistribution.positive))}
            color="success"
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>
            中性评论 ({getPercentage(sentimentDistribution.neutral)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={parseFloat(getPercentage(sentimentDistribution.neutral))}
            color="primary"
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>
            消极评论 ({getPercentage(sentimentDistribution.negative)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={parseFloat(getPercentage(sentimentDistribution.negative))}
            color="error"
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default AnalysisResults; 