import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const DeleteConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  sceneName 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
          <WarningIcon sx={{ mr: 1 }} />
          确认删除场景
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          您确定要删除场景 "{sceneName}" 吗？
        </Typography>
        <Typography variant="body2" color="text.secondary">
          此操作将删除该场景下的所有文章和分析结果，且不可恢复。
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>
          取消
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="error"
        >
          确认删除
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog; 