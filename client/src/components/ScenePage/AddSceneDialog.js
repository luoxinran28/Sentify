import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';

function AddSceneDialog({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    titleEn: '',
    titleZh: '',
    source: '',
    prompt: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titleEn.trim()) newErrors.titleEn = '请输入英文标题';
    if (!formData.titleZh.trim()) newErrors.titleZh = '请输入中文标题';
    if (!formData.prompt.trim()) newErrors.prompt = '请输入Prompt';
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleClose = () => {
    setFormData({ titleEn: '', titleZh: '', source: '', prompt: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加场景</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="英文标题"
            value={formData.titleEn}
            onChange={handleChange('titleEn')}
            error={!!errors.titleEn}
            helperText={errors.titleEn}
            required
          />
          <TextField
            label="中文标题"
            value={formData.titleZh}
            onChange={handleChange('titleZh')}
            error={!!errors.titleZh}
            helperText={errors.titleZh}
            required
          />
          <TextField
            label="来源"
            value={formData.source}
            onChange={handleChange('source')}
          />
          <TextField
            label="Prompt"
            value={formData.prompt}
            onChange={handleChange('prompt')}
            error={!!errors.prompt}
            helperText={errors.prompt}
            required
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleSubmit} variant="contained">
          添加
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddSceneDialog; 