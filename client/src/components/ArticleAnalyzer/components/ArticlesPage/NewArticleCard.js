import React, { forwardRef } from 'react';
import { Box, Paper, TextField, Button, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const NewArticleCard = forwardRef(({
  value,
  onChange,
  onConfirm,
  onCancel,
  error
}, ref) => {
  return (
    <Paper 
      ref={ref}
      sx={{ 
        p: 2, 
        mb: 2,
        ml: 2,
        mr: 2,
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        border: error ? '1px solid #f44336' : '1px solid transparent',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        mb: 1,
        color: 'text.secondary',
        typography: 'body2'
      }}>
        新文章
        <IconButton 
          size="small" 
          onClick={onCancel}
          aria-label="关闭"
          sx={{ 
            ml: 'auto',
            mr: -1,
            mt: -1,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box>
        <TextField
          multiline
          minRows={4}
          maxRows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请输入文章内容..."
          variant="outlined"
          fullWidth
          error={!!error}
          helperText={error}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: { xs: '120px', sm: '150px' },
              backgroundColor: 'background.paper'
            }
          }}
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        mt: 2
      }}>
        <Button 
          variant="contained"
          onClick={onConfirm}
          disabled={!value.trim()}
          sx={{
            textTransform: 'none',
            minWidth: 100
          }}
        >
          确认添加
        </Button>
      </Box>
    </Paper>
  );
});

NewArticleCard.displayName = 'NewArticleCard';

export default NewArticleCard; 