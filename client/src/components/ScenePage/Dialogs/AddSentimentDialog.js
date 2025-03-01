import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import axiosInstance from '../../../services/axiosInstance';

function AddSentimentDialog({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    code: '',
    nameEn: '',
    nameZh: '',
    description: '',
    category: 'neutral' // 默认类别
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = '请输入代码标识';
    if (!formData.nameEn.trim()) newErrors.nameEn = '请输入英文名称';
    if (!formData.nameZh.trim()) newErrors.nameZh = '请输入中文名称';
    if (!formData.category) newErrors.category = '请选择类别';
    
    // 验证code只包含字母、数字和下划线
    if (formData.code && !/^[a-zA-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = '代码标识只能包含字母、数字和下划线';
    }
    
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
    setFormData({
      code: '',
      nameEn: '',
      nameZh: '',
      description: '',
      category: 'neutral'
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>添加情感类型</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="代码标识"
            value={formData.code}
            onChange={handleChange('code')}
            error={!!errors.code}
            helperText={errors.code || '唯一标识符，如 professional, friendly 等'}
            required
          />
          <TextField
            label="英文名称"
            value={formData.nameEn}
            onChange={handleChange('nameEn')}
            error={!!errors.nameEn}
            helperText={errors.nameEn}
            required
          />
          <TextField
            label="中文名称"
            value={formData.nameZh}
            onChange={handleChange('nameZh')}
            error={!!errors.nameZh}
            helperText={errors.nameZh}
            required
          />
          <TextField
            label="描述"
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={2}
            placeholder="对该情感类型的详细描述"
          />
          
          <FormControl error={!!errors.category}>
            <InputLabel id="category-label">类别</InputLabel>
            <Select
              labelId="category-label"
              value={formData.category}
              onChange={handleChange('category')}
              label="类别"
            >
              <MenuItem value="positive">正面</MenuItem>
              <MenuItem value="negative">负面</MenuItem>
              <MenuItem value="neutral">中性</MenuItem>
              <MenuItem value="other">其他</MenuItem>
            </Select>
            {errors.category && (
              <FormHelperText>{errors.category}</FormHelperText>
            )}
          </FormControl>
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

export default AddSentimentDialog; 