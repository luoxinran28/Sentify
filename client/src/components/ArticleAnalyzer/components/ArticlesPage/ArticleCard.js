import React from 'react';
import { 
  Paper, 
  Box, 
  TextField, 
  Checkbox 
} from '@mui/material';

const ArticleCard = ({ 
  article, 
  index, 
  isSelecting,
  isSelected,
  loading,
  onArticleChange,
  onClick
}) => {
  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 2, 
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        cursor: isSelecting ? 'pointer' : 'default',
        bgcolor: isSelecting && isSelected ? 'action.selected' : 'background.paper',
        '&:hover': isSelecting ? {
          bgcolor: 'action.hover'
        } : {}
      }}
      onClick={onClick}
    >
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        mb: 1,
        color: 'text.secondary',
        typography: 'body2'
      }}>
        原文{index + 1}
      </Box>
      {isSelecting && (
        <Checkbox
          checked={isSelected}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8,
            pointerEvents: 'none'  // 防止复选框捕获点击事件
          }}
        />
      )}
      <Box sx={{ 
        pl: isSelecting ? 0 : 0,
        transition: 'padding-left 0.2s ease-in-out'
      }}>
        <TextField
          multiline
          minRows={4}
          maxRows={6}
          value={typeof article === 'string' ? article : article.text || ''}
          onChange={(e) => onArticleChange(e.target.value)}
          placeholder="请输入内容..."
          variant="outlined"
          fullWidth
          disabled={loading || isSelecting}
          onClick={(e) => {
            if (isSelecting) {
              e.stopPropagation();  // 防止文本框点击触发卡片选择
            }
          }}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: { xs: '120px', sm: '150px' },
              backgroundColor: 'background.paper'
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default ArticleCard; 