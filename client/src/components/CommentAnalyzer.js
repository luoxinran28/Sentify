import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import { analyzeComments } from '../services/api';
import AnalysisResults from './AnalysisResults';

function CommentAnalyzer() {
  const [comments, setComments] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async () => {
    if (!comments.trim()) {
      setSnackbar({
        open: true,
        message: '请输入评论',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeComments(comments);
      setResults(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || '分析失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1">
          客户评论分析器
        </Typography>
        
        <TextField
          multiline
          rows={6}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="在此粘贴客户评论..."
          variant="outlined"
          fullWidth
        />
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {loading ? '分析中...' : '分析评论'}
        </Button>

        {results && <AnalysisResults results={results} />}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default CommentAnalyzer; 