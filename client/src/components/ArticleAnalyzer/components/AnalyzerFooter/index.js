import React from 'react';
import { 
  Paper, 
  Button,
  Box,
  CircularProgress,
  Divider,
  Slide,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useScrollCompact from '../../../../hooks/useScrollCompact';

const StyledFooter = styled(Paper)(({ theme, iscompact }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  height: iscompact === 'true' ? '40px' : '48px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'none',
  boxShadow: 'none',
  transition: 'all 0.3s ease-in-out'
}));

const ButtonGroup = styled(Box)(({ theme, iscompact }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid rgba(0, 0, 0, 0.12)`,
  overflow: 'hidden',
  zIndex: 20,
  transition: 'all 0.3s ease-in-out'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(0, 3),
  borderRadius: 0,
  textTransform: 'none',
  fontSize: '0.875rem',
  minWidth: 'auto',
  whiteSpace: 'nowrap',
  color: 'rgba(0, 0, 0, 0.87)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  },
  '&.Mui-disabled': {
    color: 'rgba(0, 0, 0, 0.38)'
  }
}));

const ActionPanel = styled(Box)(({ theme, iscompact }) => ({
  position: 'absolute',
  bottom: iscompact === 'true' ? 40 : 48,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  border: `1px solid rgba(0, 0, 0, 0.12)`,
  borderBottom: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 'auto',
  maxWidth: '100%',
  transition: 'all 0.3s ease-in-out'
}));

const AnalyzerFooter = ({ 
  onAnalyze, 
  onAddArticle,
  onSelectAll,
  onDelete,
  loading, 
  disabled,
  isSelecting,
  selectedCount,
  totalCount,
  onToggleSelect
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const isCompact = useScrollCompact(50);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <>
      <StyledFooter iscompact={isCompact.toString()}>
        <ButtonGroup iscompact={isCompact.toString()}>
          <ActionButton
            onClick={onToggleSelect}
          >
            {isSelecting ? '取消' : '操作'}
          </ActionButton>
          
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(0, 0, 0, 0.12)' }} />
          
          <ActionButton
            onClick={onAddArticle}
            disabled={loading || isSelecting}
          >
            添加
          </ActionButton>
          
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(0, 0, 0, 0.12)' }} />
          
          <ActionButton
            onClick={onAnalyze}
            disabled={disabled || loading || isSelecting}
            startIcon={loading && <CircularProgress size={16} sx={{ color: 'inherit' }} />}
          >
            {loading ? '分析中...' : '开始分析'}
          </ActionButton>
        </ButtonGroup>

        <Slide direction="up" in={isSelecting} mountOnEnter unmountOnExit>
          <ActionPanel iscompact={isCompact.toString()}>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              position: 'relative'
            }}>
              <ActionButton onClick={onSelectAll}>
                全选
              </ActionButton>
              <ActionButton
                sx={{ color: 'rgba(255, 0, 0, 0.7)' }}
                onClick={handleDelete}
                disabled={selectedCount === 0}
              >
                删除
              </ActionButton>
            </Box>
          </ActionPanel>
        </Slide>
      </StyledFooter>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
            确定要删除选中的 {selectedCount} 篇文章吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            取消
          </Button>
          <Button 
            onClick={confirmDelete} 
            sx={{ color: 'rgba(255, 0, 0, 0.7)' }}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AnalyzerFooter; 