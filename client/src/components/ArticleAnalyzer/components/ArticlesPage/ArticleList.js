import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Container, Snackbar, Alert, Input, Button } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import { articleService } from '../../../../services/articleService';
import InfiniteScroll from '../../../common/InfiniteScroll';
import ArticleCard from './ArticleCard';
import LoadingSpinner from '../../../common/LoadingSpinner';
import AnalysisList from '../AnalysisPage/AnalysisList';
import OverviewPage from '../OverviewPage';
import AnalyzerHeader from '../AnalyzerHeader';
import AnalyzerFooter from '../AnalyzerFooter';
import NewArticleCard from './NewArticleCard';
import { readExcelFile } from '../../utils/excelHandler';
import { validateArticle, validateExcelFile } from '../../utils/validators';

const ArticleList = () => {
  const location = useLocation();
  const { scene } = location.state || {};
  const { scenarioId } = useParams();
  
  // 状态管理
  const [articles, setArticles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentTab, setCurrentTab] = useState('articles');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState(new Set());
  const [newArticle, setNewArticle] = useState('');
  const [showNewArticleCard, setShowNewArticleCard] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState(new Set());

  const fileInputRef = useRef(null);
  const newArticleCardRef = useRef(null);

  // 加载场景文章
  const loadScenarioArticles = useCallback(async (pageNum, limit) => {
    try {
      setLoading(true);
      const data = await articleService.getArticlesWithAnalysis(scenarioId, pageNum, limit);
      
      if (data.articles && data.articles.length > 0) {
        const newArticles = data.articles.map(article => ({ 
          text: article.content,
          id: article.id,
          createdAt: article.createdAt,
          analyzed: !!data.results
        }));

        if (pageNum === 1) {
          setArticles(newArticles);
        } else {
          setArticles(prev => [...prev, ...newArticles]);
        }
        
        setHasMore(data.pagination.currentPage < data.pagination.totalPages);
        
        if (data.results) {
          setResults(data.results);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载场景文章错误:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  // 加载更多文章
  const loadMoreArticles = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prevPage => {
        loadScenarioArticles(prevPage + 1, 20);
        return prevPage + 1;
      });
    }
  }, [loading, hasMore, loadScenarioArticles]);

  // 分析新文章
  const analyzeNewArticles = useCallback(async (newArticles) => {
    if (!newArticles || newArticles.length === 0) return;

    try {
      const analysisResult = await articleService.analyzeArticles(
        newArticles.map(a => a.text),
        scenarioId
      );

      setResults(prevResults => {
        if (!prevResults) return analysisResult;
        return {
          ...prevResults,
          totalArticles: prevResults.totalArticles + analysisResult.totalArticles,
          sentimentDistribution: {
            hasty: (prevResults.sentimentDistribution?.hasty || 0) + (analysisResult.sentimentDistribution?.hasty || 0),
            emotional: (prevResults.sentimentDistribution?.emotional || 0) + (analysisResult.sentimentDistribution?.emotional || 0),
            functional: (prevResults.sentimentDistribution?.functional || 0) + (analysisResult.sentimentDistribution?.functional || 0)
          },
          individualResults: [
            ...(prevResults.individualResults || []),
            ...(analysisResult.individualResults || [])
          ]
        };
      });

      setArticles(prevArticles => 
        prevArticles.map(article => ({
          ...article,
          analyzed: true
        }))
      );

    } catch (error) {
      console.error('分析新文章错误:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  }, [scenarioId]);

  // 初始加载
  useEffect(() => {
    if (scenarioId) {
      loadScenarioArticles(1);
    }
  }, [scenarioId]);

  // 处理文章变更
  const handleArticleChange = (index, value) => {
    const newArticles = [...articles];
    newArticles[index] = { text: value };
    setArticles(newArticles);
  };

  // 添加新文章
  const handleAddArticle = () => {
    setShowNewArticleCard(true);
    setNewArticle('');
    setError('');
    
    setTimeout(() => {
      newArticleCardRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  const handleCancelAdd = () => {
    setShowNewArticleCard(false);
    setNewArticle('');
    setError('');
  };

  const handleConfirmAdd = () => {
    const validation = validateArticle(newArticle, articles);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setArticles(prev => [...prev, { text: newArticle }]);
    setShowNewArticleCard(false);
    setNewArticle('');
    setError('');
  };

  // 删除文章
  const handleDeleteSelected = async () => {
    if (selectedArticles.size === 0) return;

    try {
      const articleIds = Array.from(selectedArticles);
      await articleService.deleteArticles(scenarioId, articleIds);
      
      setArticles(prevArticles => 
        prevArticles.filter(article => !selectedArticles.has(article.id))
      );
      
      setSelectedArticles(new Set());
      setSnackbar({
        open: true,
        message: `已删除 ${articleIds.length} 篇文章`,
        severity: 'success'
      });
      
      // 重新加载第一页
      setPage(1);
      loadScenarioArticles(1, 20);
    } catch (error) {
      console.error('删除文章错误:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  // 文件上传处理
  const handleUpload = () => {
    if (isSelecting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const fileValidation = validateExcelFile(file);
    if (!fileValidation.isValid) {
      setSnackbar({
        open: true,
        message: fileValidation.error,
        severity: 'error'
      });
      return;
    }

    try {
      const articles = await readExcelFile(file);
      
      if (articles.length === 0) {
        setSnackbar({
          open: true,
          message: '未在Excel文件中找到有效内容',
          severity: 'error'
        });
        return;
      }

      if (articles.length > 20) {
        setSnackbar({
          open: true,
          message: '一次最多只能导入20条内容，请减少Excel中的数量',
          severity: 'error'
        });
        return;
      }

      const tooLongArticles = articles.filter(text => text.length > 1000);
      if (tooLongArticles.length > 0) {
        setSnackbar({
          open: true,
          message: '单条内容长度不能超过1000个字符，请检查Excel中的内容',
          severity: 'error'
        });
        return;
      }

      setArticles(prevArticles => {
        const newArticles = articles.map(text => ({ text }));
        if (prevArticles.length + newArticles.length > 20) {
          setSnackbar({
            open: true,
            message: '内容总数不能超过20条，请先清空一些现有内容',
            severity: 'error'
          });
          return prevArticles;
        }
        return [...prevArticles, ...newArticles];
      });

      setSnackbar({
        open: true,
        message: `成功导入 ${articles.length} 条内容`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Excel处理错误:', error);
      setSnackbar({
        open: true,
        message: error.message || '处理Excel文件失败',
        severity: 'error'
      });
    }

    event.target.value = '';
  };

  // Tab 切换
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // 选择相关
  const handleToggleSelect = () => {
    setIsSelecting(!isSelecting);
    setSelectedArticles(new Set());
  };

  const handleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map((_, index) => index)));
    }
  };

  const handleToggleArticle = (index) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedArticles(newSelected);
  };

  // 分析处理
  const handleAnalyze = async () => {
    if (isSelecting) return;
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

      const result = await articleService.analyzeArticles(validArticles, scenarioId);
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

  // 清空文章
  const handleClearArticles = async () => {
    try {
      await articleService.clearArticles(scenarioId);
      setArticles([]);
      setResults(null);
      setPage(1);
      setHasMore(false);
      setSnackbar({
        open: true,
        message: '已清空所有文章',
        severity: 'success'
      });
    } catch (error) {
      console.error('清空文章错误:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  // Snackbar 关闭
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // 新增：处理文章展开/折叠
  const handleAccordionChange = (index) => (event, isExpanded) => {
    const newExpanded = new Set(expandedArticles);
    if (isExpanded) {
      newExpanded.add(index);
    } else {
      newExpanded.delete(index);
    }
    setExpandedArticles(newExpanded);
  };

  // 新增：处理全部展开/折叠
  const handleExpandAll = (expand) => {
    if (expand) {
      setExpandedArticles(new Set(articles.map((_, index) => index)));
    } else {
      setExpandedArticles(new Set());
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'articles':
        return (
          <InfiniteScroll
            loading={loading}
            hasMore={hasMore && articles.length > 0}
            onLoadMore={loadMoreArticles}
            loadingSpinner={<LoadingSpinner />}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {articles.length > 0 ? (
                articles.map((article, index) => (
                  <ArticleCard
                    key={article.id || index}
                    article={article}
                    index={index}
                    isSelecting={isSelecting}
                    isSelected={selectedArticles.has(index)}
                    loading={loading}
                    expanded={expandedArticles.has(index)}
                    onChange={handleAccordionChange(index)}
                    onArticleChange={(value) => handleArticleChange(index, value)}
                    onClick={() => {
                      if (isSelecting) {
                        handleToggleArticle(index);
                      }
                    }}
                  />
                ))
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pt: 3,
                    pb: 1,
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="body1">
                    点击下方"添加"，开始你的旅程吧！
                  </Typography>
                </Box>
              )}
            </Box>
          </InfiniteScroll>
        );
      case 'overview':
        return <OverviewPage
                results={results}
                articles={articles}
              />
      case 'analysis':
        return <AnalysisList
                results={results}
                articles={articles}
              />
      default:
        return null;
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      <AnalyzerHeader 
        onUpload={handleUpload}
        onClear={handleClearArticles}
        sceneTitle={scene?.titleZh}
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />
      
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
      {renderContent()}
      </Box>
    </Container>
      
      <AnalyzerFooter
        onAnalyze={handleAnalyze}
        onAddArticle={handleAddArticle}
        onSelectAll={handleSelectAll}
        onDelete={handleDeleteSelected}
        loading={loading}
        disabled={articles.length === 0}
        isSelecting={isSelecting}
        selectedCount={selectedArticles.size}
        totalCount={articles.length}
        onToggleSelect={handleToggleSelect}
        expandedCount={expandedArticles.size}
        onExpandAll={handleExpandAll}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Input
        type="file"
        inputRef={fileInputRef}
        sx={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".xlsx,.xls"
      />

      {showNewArticleCard && (
        <NewArticleCard
          ref={newArticleCardRef}
          value={newArticle}
          onChange={setNewArticle}
          onConfirm={handleConfirmAdd}
          onCancel={handleCancelAdd}
          error={error}
        />
      )}
    </Box>
  );
};

export default ArticleList; 