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
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { scenarioService } from '../../services/scenarioService';
import SceneCard from './SceneCard';
import SceneHeader from './SceneHeader';
import AddSceneDialog from './Dialogs/AddSceneDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import InfiniteScroll from '../common/InfiniteScroll';
import EditSceneDialog from './Dialogs/EditSceneDialog';
import DeleteConfirmDialog from './Dialogs/DeleteConfirmDialog';
import axiosInstance from '../../services/axiosInstance';


function SceneList({ onLogout }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingScene, setEditingScene] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
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

  const handleAddScene = async (newScene) => {
    setLoading(true);
    try {
      // 创建新场景
      const response = await axiosInstance.post('/scenarios', {
        titleEn: newScene.titleEn,
        titleZh: newScene.titleZh,
        source: newScene.source,
        prompt: newScene.prompt
      });

      if (response.data) {
        const scenarioId = response.data.id;
        
        // 添加情感类型关联
        for (const sentimentId of newScene.sentiments) {
          await axiosInstance.post(`/scenarios/${scenarioId}/sentiments/${sentimentId}`);
        }

        // 更新场景列表
        loadScenarios(1, new AbortController().signal);
        setOpenAddDialog(false);
        setSnackbar({
          open: true,
          message: '场景创建成功',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('创建场景失败:', error);
      setSnackbar({
        open: true,
        message: `创建场景失败: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    // 退出编辑模式时清除相关状态
    if (isEditing) {
      setEditingScene(null);
    }
  };

  const handleEditScene = (scene) => {
    setEditingScene(scene);
  };

  const handleSaveScene = async (updatedScene) => {
    setLoading(true);
    try {
      // 更新场景基本信息
      const response = await axiosInstance.put(`/scenarios/${updatedScene.id}`, {
        titleEn: updatedScene.titleEn,
        titleZh: updatedScene.titleZh,
        source: updatedScene.source,
        prompt: updatedScene.prompt
      });

      if (response.data) {
        // 获取当前场景的情感类型
        const currentSentimentsResponse = await axiosInstance.get(`/scenarios/${updatedScene.id}/sentiments`);
        const currentSentiments = currentSentimentsResponse.data;
        
        // 找出需要添加的情感类型
        const sentimentsToAdd = updatedScene.sentiments.filter(
          id => !currentSentiments.some(s => s.id === id)
        );
        
        // 找出需要删除的情感类型
        const sentimentsToRemove = currentSentiments.filter(
          s => !updatedScene.sentiments.includes(s.id)
        );
        
        // 添加新的情感类型
        for (const sentimentId of sentimentsToAdd) {
          await axiosInstance.post(`/scenarios/${updatedScene.id}/sentiments/${sentimentId}`);
        }
        
        // 删除不需要的情感类型
        for (const sentiment of sentimentsToRemove) {
          await axiosInstance.delete(`/scenarios/${updatedScene.id}/sentiments/${sentiment.id}`);
        }

        // 更新场景列表
        loadScenarios(1, new AbortController().signal);
        setEditingScene(null);
        setSnackbar({
          open: true,
          message: '场景更新成功',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('更新场景失败:', error);
      setSnackbar({
        open: true,
        message: `更新场景失败: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (scene) => {
    setSceneToDelete(scene);
    setShowDeleteDialog(true);
    setEditingScene(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await scenarioService.deleteScenario(sceneToDelete.id);
      
      // 更新本地状态
      setScenarios(prev => prev.filter(s => s.id !== sceneToDelete.id));
      
      setShowDeleteDialog(false);
      setSceneToDelete(null);
    } catch (error) {
      console.error('删除场景失败:', error);
      // 可以添加错误提示
    }
  };

  // Header 的菜单项配置
  const menuItems = [
    {
      label: '添加场景',
      onClick: () => setOpenAddDialog(true),
      disabledInEdit: true  // 编辑模式下禁用
    },
    {
      label: '退出登录',
      onClick: onLogout,
      disabledInEdit: true  // 编辑模式下禁用
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
                  ...scene,
                  hasLink: true  // 确保每个场景都有这个属性
                }}
                onClick={() => handleSceneClick(scene)}
                onEdit={handleEditScene}
                isEditing={isEditing}
              />
            </Grid>
          ))}
        </Grid>
      </InfiniteScroll>
    </Container>
  );

  // Snackbar 关闭处理函数
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <SceneHeader 
        menuItems={menuItems} 
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
      />
      {content}
      <AddSceneDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSubmit={handleAddScene}
      />
      <EditSceneDialog
        open={Boolean(editingScene)}
        onClose={() => setEditingScene(null)}
        onSave={handleSaveScene}
        onDelete={handleDeleteClick}
        scene={editingScene}
        lastModified={editingScene?.updatedAt}
      />
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        sceneName={sceneToDelete?.titleZh}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SceneList; 