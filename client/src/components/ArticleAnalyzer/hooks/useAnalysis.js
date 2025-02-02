import { useState } from 'react';
import { articleService } from '../../../services/articleService';

export const useAnalysis = () => {
  const [results, setResults] = useState(null);
  const [currentTab, setCurrentTab] = useState('articles');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAnalyze = async (articles, sceneId) => {
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

      const result = await articleService.analyzeArticles(validArticles, sceneId);
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

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  return {
    results,
    currentTab,
    snackbar,
    setSnackbar,
    handleAnalyze,
    handleTabChange
  };
}; 