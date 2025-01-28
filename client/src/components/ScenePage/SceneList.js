import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { 
  Container, 
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Box,
  Typography,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { scenarioService } from '../../services/scenarioService';
import SceneCard from './SceneCard';
import Header from '../Header';
import AddSceneDialog from './AddSceneDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import InfiniteScroll from '../common/InfiniteScroll';


function SceneList({ onLogout }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTabletPortrait = useMediaQuery('(min-width:600px) and (max-width:900px) and (orientation: portrait)');

  const getGridCols = () => {
    if (isMobile || isTabletPortrait) return 6;
    return 3;
  };

  const loadScenarios = useCallback(async (pageNum, signal) => {
    try {
      setLoading(true);
      const response = await scenarioService.getScenarios(pageNum, signal);
      
      if (pageNum === 1) {
        setScenarios(response.scenarios);
      } else {
        setScenarios(prev => [...prev, ...response.scenarios]);
      }
      
      setHasMore(response.pagination.currentPage < response.pagination.totalPages);
    } catch (error) {
      if (error.name !== 'AbortError') {  // 忽略取消请求的错误
        console.error('获取场景列表失败:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    const abortController = new AbortController();
    loadScenarios(page, abortController.signal);
    
    return () => {
      abortController.abort(); // 组件卸载时取消请求
    };
  }, [page, loadScenarios]);

  const handleSceneClick = (scene) => {
    navigate(`/article-analyzer/${scene.id}`, { state: { scene } });
  };

  const handleAddScene = async (data) => {
    try {
      const newScenario = await scenarioService.createScenario(data);
      setOpenAddDialog(false);
      // 直接更新状态，避免重新请求
      setScenarios(prev => [newScenario, ...prev]);
    } catch (error) {
      console.error('创建场景失败:', error);
      setError(error.response?.data?.message || '创建场景失败');
    }
  };

  // Header 的菜单项配置
  const menuItems = [
    {
      label: '添加场景',
      onClick: () => setOpenAddDialog(true)
    },
    {
      label: '退出登录',
      onClick: onLogout
    }
  ];

  const content = loading && page === 1 ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  ) : error ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Typography color="error">{error}</Typography>
    </Box>
  ) : (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <InfiniteScroll
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        loadingSpinner={<LoadingSpinner />}
      >
        <Grid container spacing={3}>
          {scenarios.map((scene) => (
            <Grid item xs={getGridCols()} key={scene.id}>
              <SceneCard 
                scene={{
                  id: scene.id,
                  titleEn: scene.titleEn,
                  titleCn: scene.titleZh,
                  source: scene.source,
                  hasLink: true,
                  prompt: scene.prompt,
                  count: scene.count
                }}
                onClick={() => handleSceneClick(scene)}
              />
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>
    </Container>
  );

  return (
    <>
      <Header menuItems={menuItems} />
      {content}
      <AddSceneDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSubmit={handleAddScene}
      />
    </>
  );
}

export default SceneList; 