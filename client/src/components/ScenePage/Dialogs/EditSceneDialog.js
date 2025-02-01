import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

const DeleteButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.error.lighter,
    color: theme.palette.error.main
  }
}));

const EditSceneDialog = ({ 
  open, 
  onClose, 
  onSave, 
  onDelete, 
  scene,
  lastModified 
}) => {
  const [formData, setFormData] = useState({
    titleEn: '',
    titleZh: '',
    source: '',
    prompt: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (scene) {
      setFormData({
        titleEn: scene.titleEn || '',
        titleZh: scene.titleZh || '',
        source: scene.source || '',
        prompt: scene.prompt || ''
      });
    }
  }, [scene]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titleEn.trim()) {
      newErrors.titleEn = '请输入英文标题';
    }
    if (!formData.titleZh.trim()) {
      newErrors.titleZh = '请输入中文标题';
    }
    if (!formData.source.trim()) {
      newErrors.source = '请输入来源';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>编辑场景</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <StyledTextField
            label="场景标题（英文）"
            fullWidth
            value={formData.titleEn}
            onChange={handleChange('titleEn')}
            error={!!errors.titleEn}
            helperText={errors.titleEn}
            required
          />
          <StyledTextField
            label="场景标题（中文）"
            fullWidth
            value={formData.titleZh}
            onChange={handleChange('titleZh')}
            error={!!errors.titleZh}
            helperText={errors.titleZh}
            required
          />
          <StyledTextField
            label="来源"
            fullWidth
            value={formData.source}
            onChange={handleChange('source')}
            error={!!errors.source}
            helperText={errors.source}
            required
          />
          <StyledTextField
            label="Prompt"
            fullWidth
            multiline
            rows={4}
            value={formData.prompt}
            onChange={handleChange('prompt')}
          />
          {lastModified && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block', mt: 2 }}
            >
              上次修改时间：{new Date(lastModified).toLocaleString()}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <DeleteButton onClick={() => onDelete(scene)}>
          删除场景
        </DeleteButton>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            取消
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            color="primary"
          >
            保存修改
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditSceneDialog; 