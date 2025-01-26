import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  IconButton,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { analyzeArticles, clearArticles } from '../../services/api';
import AnalyzerHeader from './AnalyzerHeader';
import AnalysisResults from './AnalysisResults';

function ArticleAnalyzer() {
  const location = useLocation();
  const { scene } = location.state || {};
  const [articles, setArticles] = useState([{ text: '' }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleArticleChange = (index, value) => {
    const newArticles = [...articles];
    newArticles[index] = { text: value };
    setArticles(newArticles);
  };

  const handleAddArticle = () => {
    setArticles([...articles, { text: '' }]);
  };

  const handleRemoveArticle = (index) => {
    const newArticles = articles.filter((_, i) => i !== index);
    setArticles(newArticles);
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const validArticles = articles
        .map(a => a.text)
        .filter(text => text.trim());

      if (validArticles.length === 0) {
        setSnackbar({
          open: true,
          message: '请输入要分析的内容',
          severity: 'warning'
        });
        return;
      }

      const result = await analyzeArticles(validArticles);
      setResults(result);
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

  const handleClearArticles = async () => {
    try {
      await clearArticles();
      
      setArticles([{ text: '' }]);
      setResults(null);
      
      setSnackbar({
        open: true,
        message: '内容已清空',
        severity: 'success'
      });
    } catch (error) {
      console.error('清空内容错误:', error);
      setSnackbar({
        open: true,
        message: error.message || '清空内容失败',
        severity: 'error'
      });
    }
  };

  const handleUpload = () => {
    // 处理上传功能
  };

  return (
    <>
      <AnalyzerHeader 
        onUpload={handleUpload} 
        onClearCache={handleClearArticles}
        sceneTitle={scene?.titleCn}
      />
      <Container maxWidth="md">
        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {articles.map((article, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    multiline
                    rows={2}
                    value={article.text}
                    onChange={(e) => handleArticleChange(index, e.target.value)}
                    placeholder={`内容 ${index + 1}`}
                    variant="outlined"
                    fullWidth
                    disabled={loading}
                  />
                  {articles.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveArticle(index)}
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
                onClick={handleAddArticle}
                disabled={loading}
                sx={{ alignSelf: 'flex-start' }}
              >
                添加内容
              </Button>

              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={loading}
                sx={{ alignSelf: 'flex-end' }}
              >
                开始分析
              </Button>
            </Box>
          </Paper>

          {results && <AnalysisResults results={results} articles={articles} />}
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ArticleAnalyzer; 