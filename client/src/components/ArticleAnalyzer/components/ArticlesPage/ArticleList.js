import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, Container, Snackbar, Alert, Input } from '@mui/material';
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

  const fileInputRef = useRef(null);
  const newArticleCardRef = useRef(null);

  // 加载场景文章
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
        
        analyzeNewArticles(newArticles);
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

  /**
   * 分析新载入的文章并更新状态
   * @param {Array} newArticles - 新载入的文章数组，每个元素包含 {id, text, analyzed} 
   */
  const analyzeNewArticles = async (newArticles) => {
    try {
      // 筛选出未分析的有效文章（非空且未分析）
      // 保留文章ID以便后续关联分析结果
      const validArticles = newArticles
        .filter(a => !a.analyzed && a.text?.trim())
        .map(a => ({
          id: a.id,
          text: a.text
        }));

      if (validArticles.length === 0) return;

      // 调用API进行文章分析，只传递文本内容
      const result = await articleService.analyzeArticles(validArticles.map(a => a.text), scene.id);
      
      // 将分析结果与原文章ID关联
      // 保持数组顺序与validArticles一致，确保ID对应正确
      const analysisResults = result.individualResults.map((analysis, index) => ({
        ...analysis,
        articleId: validArticles[index].id
      }));

      // 更新文章状态，标记已分析的文章
      setArticles(prevArticles => {
        return prevArticles.map(article => {
          if (!article.analyzed && article.text?.trim() && 
              validArticles.some(va => va.id === article.id)) {
            return { ...article, analyzed: true };
          }
          return article;
        });
      });

      // 更新分析结果
      setResults(prevResults => {
        // 如果是首次分析，直接使用新结果
        if (!prevResults) {
          return {
            ...result,
            individualResults: analysisResults
          };
        }
        
        // 使用Set进行文章ID去重
        // 过滤掉null/undefined的ID避免错误
        const existingIds = new Set(
          prevResults.individualResults
            .map(r => r.articleId)
            .filter(id => id != null)
        );

        // 过滤出未分析过的结果
        const newResults = analysisResults.filter(r => !existingIds.has(r.articleId));

        // 合并并去重主题
        // 使用JSON序列化确保对象比较正确
        const uniqueThemes = Array.from(
          new Set([...prevResults.themes, ...result.themes].map(JSON.stringify))
        ).map(JSON.parse);

        // 合并新旧分析结果
        const totalResults = [...prevResults.individualResults, ...newResults];
        
        // 重新计算情感分布
        const sentimentCounts = totalResults.reduce((acc, curr) => {
          acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
          return acc;
        }, {});

        // 返回更新后的完整结果
        return {
          totalArticles: totalResults.length,
          sentimentDistribution: {
            positive: sentimentCounts.positive || 0,
            negative: sentimentCounts.negative || 0,
            neutral: sentimentCounts.neutral || 0
          },
          averageSentiment: (
            totalResults.reduce((sum, curr) => sum + parseFloat(curr.score), 0) /
            totalResults.length
          ).toFixed(2),
          themes: uniqueThemes,
          individualResults: totalResults
        };
      });
    } catch (error) {
      console.error('自动分析错误:', error);
      console.error('错误详情:', {
        validArticles: validArticles?.length,
        newArticles: newArticles?.length,
        error: error.message
      });
    }
  };

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
    try {
      const selectedIndexes = Array.from(selectedArticles);
      const selectedArticleIds = selectedIndexes.map(index => articles[index].id).filter(Boolean);
      
      if (selectedArticleIds.length > 0) {
        await articleService.deleteArticles(scenarioId, selectedArticleIds);
      }
      
      const newArticles = articles.filter((_, index) => !selectedArticles.has(index));
      setArticles(newArticles.length > 0 ? newArticles : []);
      
      if (selectedIndexes.some(index => articles[index].analyzed)) {
        setResults(null);
      }
      
      setIsSelecting(false);
      setSelectedArticles(new Set());
      
      setSnackbar({
        open: true,
        message: `成功删除 ${selectedIndexes.length} 篇文章`,
        severity: 'success'
      });
    } catch (error) {
      console.error('删除文章失败:', error);
      setSnackbar({
        open: true,
        message: '删除文章失败',
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

  // 加载更多
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      loadScenarioArticles(page);
    }
  }, [page]);

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

      const result = await articleService.analyzeArticles(validArticles, scene.id);
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
      await articleService.clearArticles(scene.id);
      
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

  // Snackbar 关闭
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'articles':
        return (
          <InfiniteScroll
            loading={loading}
            hasMore={hasMore && articles.length > 0}
            onLoadMore={handleLoadMore}
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
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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