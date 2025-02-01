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

const ActionPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 48,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
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

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <>
      <StyledFooter elevation={1}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          maxWidth: 400,
          margin: '0 auto'
        }}>
          <ActionButton
            color="inherit"
            onClick={onToggleSelect}
          >
            {isSelecting ? '取消' : '操作'}
          </ActionButton>
          
          <Divider orientation="vertical" flexItem />
          
          <ActionButton
            color="inherit"
            onClick={onAddArticle}
            disabled={loading || isSelecting}
          >
            添加文章
          </ActionButton>
          
          <Divider orientation="vertical" flexItem />
          
          <ActionButton
            color="inherit"
            onClick={onAnalyze}
            disabled={disabled || loading || isSelecting}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
          >
            {loading ? '分析中...' : '开始分析'}
          </ActionButton>
        </Box>

        <Slide direction="up" in={isSelecting} mountOnEnter unmountOnExit>
          <ActionPanel>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: 400,
              margin: '0 auto',
              width: '100%',
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ActionButton color="inherit" onClick={onSelectAll}>
                  全选
                </ActionButton>
                <ActionButton
                  color="error"
                  onClick={handleDelete}
                  disabled={selectedCount === 0}
                >
                  删除
                </ActionButton>
              </Box>
              {selectedCount > 0 && (
                <Box sx={{ 
                  position: 'absolute',
                  right: 0,
                  color: 'text.secondary'
                }}>
                  已选择 {selectedCount}/{totalCount} 篇文章
                </Box>
              )}
            </Box>
          </ActionPanel>
        </Slide>
      </StyledFooter>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除选中的 {selectedCount} 篇文章吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>取消</Button>
          <Button onClick={confirmDelete} color="error">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AnalyzerFooter; 