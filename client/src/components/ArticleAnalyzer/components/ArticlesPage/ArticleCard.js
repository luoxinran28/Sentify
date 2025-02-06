import React from 'react';
import { 
  Paper, 
  Box, 
  TextField, 
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ArticleCard = ({ 
  article, 
  index, 
  isSelecting,
  isSelected,
  loading,
  onArticleChange,
  onClick,
  expanded,
  onChange
}) => {
  // 获取文章预览文本
  const previewText = typeof article === 'string' 
    ? article 
    : article.text || '';
  
  const truncatedPreview = previewText.length > 28 
    ? `${previewText.substring(0, 28)}...` 
    : previewText;

  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      sx={{
        mb: 1,
        '&:before': {
          display: 'none',
        },
        transition: 'all 0.2s ease-in-out',
        bgcolor: isSelecting && isSelected ? 'action.selected' : 'background.paper',
        '&:hover': isSelecting ? {
          bgcolor: 'action.hover'
        } : {}
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={(e) => {
          if (isSelecting) {
            e.stopPropagation();
            onClick();
          }
        }}
        sx={{
          minHeight: 48,
          cursor: isSelecting ? 'pointer' : 'default',
          '& .MuiAccordionSummary-content': {
            alignItems: 'center'
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          flex: 1,
          gap: 2
        }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ minWidth: 60 }}
          >
            原文{index + 1}
          </Typography>
          
          {!expanded && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {truncatedPreview}
            </Typography>
          )}
          
          {isSelecting && (
            <Checkbox
              checked={isSelected}
              sx={{ 
                ml: 'auto',
                pointerEvents: 'none'
              }}
            />
          )}
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <TextField
          multiline
          minRows={4}
          value={typeof article === 'string' ? article : article.text || ''}
          onChange={(e) => onArticleChange(e.target.value)}
          placeholder="请输入内容..."
          variant="outlined"
          fullWidth
          disabled={loading || isSelecting}
          onClick={(e) => {
            if (isSelecting) {
              e.stopPropagation();
            }
          }}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: '120px',
              height: 'auto'
            },
            '& .MuiInputBase-input': {
              maxHeight: 'none'
            }
          }}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default ArticleCard; 