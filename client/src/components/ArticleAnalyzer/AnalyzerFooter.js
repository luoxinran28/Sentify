import React from 'react';
import { 
  Paper, 
  Button,
  Box,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  height: 48,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(0, 3),
  borderRadius: 0,
  textTransform: 'none',
  fontSize: '0.875rem',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const AnalyzerFooter = ({ 
  onAnalyze, 
  onAddArticle,
  loading, 
  disabled
}) => {
  return (
    <StyledFooter elevation={1}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        height: '100%',
        maxWidth: 'lg',
        width: '100%',
        margin: '0 auto'
      }}>
        <ActionButton
          color="inherit"
          onClick={onAddArticle}
          disabled={loading}
        >
          添加文章
        </ActionButton>
        
        <Divider orientation="vertical" flexItem />
        
        <ActionButton
          color="inherit"
          onClick={onAnalyze}
          disabled={disabled || loading}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
        >
          {loading ? '分析中...' : '开始分析'}
        </ActionButton>
      </Box>
    </StyledFooter>
  );
};

export default AnalyzerFooter; 