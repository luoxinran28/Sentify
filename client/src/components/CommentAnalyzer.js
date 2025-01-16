import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { analyzeComments } from '../services/api';
import AnalysisResults from './AnalysisResults';

const EXAMPLE_COMMENTS = [
  `I ordered this case for when I do not want to carry a purse. The case itself is very nice, I was expecting it to feel cheap but that’s not the case at all! It fit my ID and 2 cards very well. They are a little tight in there but that makes it feel very secure. I am sure they will lose a bit as I use it. The magnets holding it together seem to be very strong and I have no worries of it coming undone. Overall very satisfied 🙌🏼`,
  `Looks nice and has a nice feel. I was disappointed to find that at most it can carry one card and my ID and that’s it. I have multiple cards that I need to carry on a daily basis and wish I would of been informed better that this is made for one card and a ID and that’s about it. It makes it nice and slim which I like but isn’t something I can use for my life.`,
  `Honestly the Case seems to be built very well as far as the seams and durability but I will note, it’s very bulky and only holds maybe 3/4 cards, I feel as though the pockets themselves need revised the license pocket doesn’t fully fit the license it needs to be longer or possibly switched to the opposite side, but if you’re a minimalist and don’t mind taking your id out anytime you need info off of it then this case is actually pretty good but would definitely be a 5 star if it was revised a little`
];

function CommentAnalyzer() {
  const [comments, setComments] = useState(EXAMPLE_COMMENTS.map(comment => ({ text: comment })));
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAddComment = () => {
    setComments([...comments, { text: '' }]);
  };

  const handleRemoveComment = (index) => {
    const newComments = comments.filter((_, i) => i !== index);
    setComments(newComments);
  };

  const handleCommentChange = (index, value) => {
    const newComments = [...comments];
    newComments[index] = { text: value };
    setComments(newComments);
  };

  const handleSubmit = async () => {
    const validComments = comments.filter(c => c.text.trim());
    if (validComments.length === 0) {
      setSnackbar({
        open: true,
        message: '请输入至少一条评论',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    setResults(null);
    
    try {
      const data = await analyzeComments(validComments.map(c => c.text));
      setResults(data);
    } catch (error) {
      console.error('分析错误:', error);
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
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          客户评论分析器
        </Typography>
        
        <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {comments.map((comment, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  multiline
                  rows={2}
                  value={comment.text}
                  onChange={(e) => handleCommentChange(index, e.target.value)}
                  placeholder={`评论 ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  disabled={loading}
                />
                {comments.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveComment(index)}
                    disabled={loading}
                    color="error"
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddComment}
              disabled={loading}
              sx={{ alignSelf: 'flex-start' }}
            >
              添加评论
            </Button>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? '分析中...' : '分析评论'}
          </Button>
          
          {loading && (
            <Typography variant="body2" color="text.secondary">
              正在使用 DeepSeek 分析评论...
            </Typography>
          )}
        </Box>

        {results && <AnalysisResults results={results} comments={comments} />}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
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