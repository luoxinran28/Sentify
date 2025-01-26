import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { scenarioApi } from '../../services/api';
import SceneCard from './SceneCard';
import Header from '../Header';
import AddSceneDialog from './AddSceneDialog';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Article as ArticleIcon
} from '@mui/icons-material';

function SceneList({ onLogout }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTabletPortrait = useMediaQuery('(min-width:600px) and (max-width:900px) and (orientation: portrait)');

  const getGridCols = () => {
    if (isMobile || isTabletPortrait) return 6;
    return 3;
  };

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const response = await scenarioApi.getScenarios();
      setScenarios(response.scenarios);
    } catch (error) {
      setError('获取场景列表失败');
      console.error('获取场景列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleSceneClick = (scene) => {
    navigate(`/article-analyzer/${scene.id}`, { state: { scene } });
  };

  const handleAddScene = async (data) => {
    try {
      await scenarioApi.createScenario(data);
      setOpenAddDialog(false);
      fetchScenarios();
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

  const content = loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  ) : error ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Typography color="error">{error}</Typography>
    </Box>
  ) : (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {scenarios.map((scene) => (
          <Grid item xs={getGridCols()} key={scene.id}>
            <SceneCard 
              scene={{
                id: scene.id,
                titleEn: scene.title_en,
                titleCn: scene.title_zh,
                source: scene.source,
                hasLink: true,
                prompt: scene.prompt
              }}
              onClick={() => handleSceneClick(scene)}
            />
          </Grid>
        ))}
      </Grid>
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