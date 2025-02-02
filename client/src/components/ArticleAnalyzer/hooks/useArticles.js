import { useState, useCallback } from 'react';
import { articleService } from '../../../services/articleService';

export const useArticles = (scenarioId) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadScenarioArticles = useCallback(async (pageNum, limit) => {
    try {
      setLoading(true);
      const data = await articleService.getScenarioArticles(scenarioId, pageNum, limit);
      
      if (data.articles && data.articles.length > 0) {
        const newArticles = data.articles.map(article => ({ 
          text: article.content,
          id: article.id,
          analyzed: false
        }));

        if (pageNum === 1) {
          setArticles(newArticles);
        } else {
          setArticles(prev => [...prev, ...newArticles]);
        }
        
        setHasMore(data.pagination.currentPage < data.pagination.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载场景文章错误:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  const handleArticleChange = (index, value) => {
    const newArticles = [...articles];
    newArticles[index] = { text: value };
    setArticles(newArticles);
  };

  const addArticle = (newArticle) => {
    setArticles(prev => [...prev, newArticle]);
  };

  const removeArticle = (index) => {
    const newArticles = articles.filter((_, i) => i !== index);
    setArticles(newArticles);
  };

  return {
    articles,
    setArticles,
    loading,
    setLoading,
    error,
    setError,
    page,
    setPage,
    hasMore,
    loadScenarioArticles,
    handleArticleChange,
    addArticle,
    removeArticle
  };
}; 