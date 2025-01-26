import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
} from '@mui/material';

function SceneCard({ scene, onClick }) {
  return (
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
      onClick={onClick}
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
  );
}

export default SceneCard; 