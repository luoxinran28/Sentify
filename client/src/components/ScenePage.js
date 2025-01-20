import React from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

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
      navigate('/analyzer', { 
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
              <Card 
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: scene.hasLink ? 'pointer' : 'default',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: scene.hasLink ? 'scale(1.02)' : 'none',
                    boxShadow: scene.hasLink ? '0 8px 24px rgba(0,0,0,0.12)' : 'none'
                  }
                }}
                onClick={() => handleSceneClick(scene)}
              >
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3 
                }}>
                  <Box 
                    sx={{ 
                      minHeight: 160,
                      maxHeight: 240,
                      bgcolor: '#f8f9fa',
                      mb: 2.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease-in-out',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        color: '#ababab',
                        fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem' },
                        fontWeight: 300,
                        opacity: 0.9,
                        letterSpacing: '0.5rem',
                        marginRight: '-0.5rem',
                        textAlign: 'center',
                        padding: '1rem'
                      }}
                    >
                      {scene.titleCn?.slice(0, 2) || ''}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        mb: 1
                      }}
                    >
                      {scene.titleEn}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ 
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        mb: 2
                      }}
                    >
                      {scene.titleCn}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 'auto',
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.85rem',
                        fontWeight: 500
                      }}
                    >
                      {scene.source}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="primary"
                      sx={{ 
                        fontSize: '0.85rem',
                        fontWeight: 500
                      }}
                    >
                      {scene.count} 条评论
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default ScenePage; 