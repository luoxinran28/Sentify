import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  IconButton,
  Snackbar,
  Alert,
  Input,
  Typography
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useLocation, useParams } from 'react-router-dom';
import { analyzeArticles, clearArticles, getScenarioArticles } from '../../services/api';
import AnalyzerHeader from './AnalyzerHeader';
import { Overview, ThemeAnalysis, ArticleAnalysisCard } from './AnalysisResults';
import InfiniteScroll from '../common/InfiniteScroll';

function ArticleAnalyzer() {
  const location = useLocation();
  const { scene } = location.state || {};
  const { scenarioId } = useParams();
  const [articles, setArticles] = useState([{ text: '' }]);
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

  const fileInputRef = useRef(null);

  const loadScenarioArticles = async (pageNum) => {
    try {
      setLoading(true);
      const data = await getScenarioArticles(scenarioId, pageNum);
      
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
      }
    } catch (error) {
      console.error('加载场景文章错误:', error);
      setSnackbar({
        open: true,
        message: '加载场景文章失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

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
      const result = await analyzeArticles(validArticles.map(a => a.text), scene.id);
      
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
      // 详细的错误日志，帮助调试
      console.error('自动分析错误:', error);
      console.error('错误详情:', {
        validArticles: validArticles?.length,
        newArticles: newArticles?.length,
        error: error.message
      });
    }
  };

  useEffect(() => {
    if (scenarioId) {
      loadScenarioArticles(1);
    }
  }, [scenarioId]);

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

      const result = await analyzeArticles(validArticles, scene.id);
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
      await clearArticles(scene.id);
      
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
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const newArticles = data
          .map(row => row[0])
          .filter(article => article && typeof article === 'string' && article.trim())
          .map(article => ({ text: article }));

        if (newArticles.length === 0) {
          setSnackbar({
            open: true,
            message: '未在Excel文件中找到有效内容',
            severity: 'error'
          });
          return;
        }

        if (newArticles.length > 20) {
          setSnackbar({
            open: true,
            message: '一次最多只能导入20条内容，请减少Excel中的数量',
            severity: 'error'
          });
          return;
        }

        const tooLongArticles = newArticles.filter(c => c.text.length > 1000);
        if (tooLongArticles.length > 0) {
          setSnackbar({
            open: true,
            message: '单条内容长度不能超过1000个字符，请检查Excel中的内容',
            severity: 'error'
          });
          return;
        }

        setArticles(prevArticles => {
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
          message: `成功导入 ${newArticles.length} 条内容`,
          severity: 'success'
        });
      } catch (error) {
        console.error('Excel解析错误:', error);
        setSnackbar({
          open: true,
          message: '无法解析Excel文件',
          severity: 'error'
        });
      }
    };

    reader.onerror = () => {
      setSnackbar({
        open: true,
        message: '读取文件失败',
        severity: 'error'
      });
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      loadScenarioArticles(page);
    }
  }, [page]);

  const renderContent = () => {
    switch (currentTab) {
      case 'articles':
        return (
          <InfiniteScroll
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {articles.map((article, index) => (
                <Box 
                  key={article.id || index}
                  sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    pt: 1
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {index + 1}
                    </Typography>
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
                  <TextField
                    multiline
                    minRows={4}
                    maxRows={6}
                    value={article.text}
                    onChange={(e) => handleArticleChange(index, e.target.value)}
                    placeholder={`请输入内容...`}
                    variant="outlined"
                    fullWidth
                    disabled={loading}
                    sx={{
                      '& .MuiInputBase-root': {
                        minHeight: { xs: '120px', sm: '150px' }
                      }
                    }}
                  />
                </Box>
              ))}

              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={loading}
                sx={{ alignSelf: 'flex-end', mt: 2 }}
              >
                开始分析
              </Button>
            </Box>
          </InfiniteScroll>
        );
      case 'overview':
        return results && (
          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Overview results={results} articles={articles} />
              <ThemeAnalysis results={results} articles={articles} />
            </Box>
          </Paper>
        );
      case 'analysis':
        return results && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.individualResults.map((result, index) => (
              <ArticleAnalysisCard
                key={index}
                result={result}
                article={articles[index].text}
                index={index + 1}
              />
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AnalyzerHeader 
        onUpload={handleUpload} 
        onClearCache={handleClearArticles}
        sceneTitle={scene?.title_zh}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onAddArticle={handleAddArticle}
      />
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {renderContent()}
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

      <Input
        type="file"
        inputRef={fileInputRef}
        sx={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".xlsx,.xls"
      />
    </>
  );
}

export default ArticleAnalyzer; 