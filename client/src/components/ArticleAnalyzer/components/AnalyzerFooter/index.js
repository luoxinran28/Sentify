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
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'none',
  boxShadow: 'none'
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  "z-index": `20`
}));

const ActionButton = styled(Button)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(0, 3),
  borderRadius: 0,
  textTransform: 'none',
  fontSize: '0.875rem',
  minWidth: 'auto',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const ActionPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 48,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  border: `1px solid ${theme.palette.divider}`,
  borderBottom: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 'auto',
  maxWidth: '100%'
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
      <StyledFooter>
        <ButtonGroup>
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
            添加
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
        </ButtonGroup>

        <Slide direction="up" in={isSelecting} mountOnEnter unmountOnExit 
          sx={{ left: 'auto'}}>
          <ActionPanel>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              position: 'relative'
            }}>
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