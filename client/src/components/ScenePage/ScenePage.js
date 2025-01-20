import React from 'react';
import { 
  Container, 
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import SceneCard from './SceneCard';

// 示例场景数据
const scenes = [
  {
    id: 1,
    titleEn: "Phone Case Product Reviews",
    titleCn: "评论手机壳产品",
    source: "Amazon",
    count: 3,
    hasLink: true
  },
  {
    id: 2,
    titleEn: "Articles with heart",
    titleCn: "用心的小作文儿",
    source: "小红书",
    count: 15,
    hasLink: false
  },
  {
    id: 3,
    titleEn: "Roasting Videos",
    titleCn: "吐槽类视频",
    source: "Tiktok",
    count: 8,
    hasLink: false
  }
];

function ScenePage({ onLogout }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTabletPortrait = useMediaQuery('(min-width:600px) and (max-width:900px) and (orientation: portrait)');

  const getGridCols = () => {
    if (isMobile || isTabletPortrait) return 6; // 一排2个
    return 3; // 一排4个
  };

  const handleSceneClick = (scene) => {
    if (scene.hasLink) {
      navigate('/comment-analyzer', { 
        state: { 
          scene: scene,
          previousPath: window.location.pathname
        } 
      });
    }
  };

  return (
    <>
      <Header onLogout={onLogout} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {scenes.map((scene) => (
            <Grid item xs={getGridCols()} key={scene.id}>
              <SceneCard 
                scene={scene} 
                onClick={() => handleSceneClick(scene)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default ScenePage; 