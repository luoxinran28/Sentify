import React, { useState, useEffect } from 'react';
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
  Chip,
  OutlinedInput,
  FormHelperText,
  Typography,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axiosInstance from '../../../services/axiosInstance';
import AddSentimentDialog from './AddSentimentDialog';

function AddSceneDialog({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    titleEn: '',
    titleZh: '',
    source: '',
    prompt: '',
    sentiments: []
  });

  const [errors, setErrors] = useState({});
  const [availableSentiments, setAvailableSentiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addSentimentDialogOpen, setAddSentimentDialogOpen] = useState(false);

  // 获取所有可用的情感类型
  useEffect(() => {
    if (open) {
      setLoading(true);
      axiosInstance.get('/scenarios/sentiments')
        .then(response => {
          console.log('获取情感类型成功:', response.data);
          setAvailableSentiments(response.data);
        })
        .catch(error => {
          console.error('获取情感类型失败:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titleEn.trim()) newErrors.titleEn = '请输入英文标题';
    if (!formData.titleZh.trim()) newErrors.titleZh = '请输入中文标题';
    if (!formData.prompt.trim()) newErrors.prompt = '请输入Prompt';
    if (formData.sentiments.length === 0) newErrors.sentiments = '请至少选择一种情感类型';
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
    setFormData({ titleEn: '', titleZh: '', source: '', prompt: '', sentiments: [] });
    setErrors({});
    onClose();
  };

  const handleAddSentiment = async (sentimentData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/scenarios/sentiments', sentimentData);
      if (response.data) {
        // 添加新创建的情感类型到列表
        setAvailableSentiments(prev => [...prev, response.data]);
        // 自动选择新创建的情感类型
        setFormData(prev => ({
          ...prev,
          sentiments: [...prev.sentiments, response.data.id]
        }));
        setAddSentimentDialogOpen(false);
      }
    } catch (error) {
      console.error('创建情感类型失败:', error);
      alert(`创建情感类型失败: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            
            <FormControl error={!!errors.sentiments}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InputLabel id="sentiments-label">情感类型</InputLabel>
                <Tooltip title="添加新的情感类型">
                  <IconButton 
                    size="small" 
                    sx={{ ml: 'auto' }}
                    onClick={() => setAddSentimentDialogOpen(true)}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Select
                labelId="sentiments-label"
                multiple
                value={formData.sentiments}
                onChange={handleChange('sentiments')}
                input={<OutlinedInput label="情感类型" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const sentiment = availableSentiments.find(s => s.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={sentiment ? sentiment.nameZh : value} 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {loading ? (
                  <MenuItem disabled>加载中...</MenuItem>
                ) : (
                  availableSentiments.map((sentiment) => (
                    <MenuItem key={sentiment.id} value={sentiment.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">{sentiment.nameZh} ({sentiment.nameEn})</Typography>
                        {sentiment.description && (
                          <Typography variant="caption" color="text.secondary">
                            {sentiment.description}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.sentiments && (
                <FormHelperText>{errors.sentiments}</FormHelperText>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                选择此场景可用的情感类型，分析结果将基于这些类型进行分类
              </Typography>
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

      <AddSentimentDialog 
        open={addSentimentDialogOpen}
        onClose={() => setAddSentimentDialogOpen(false)}
        onSubmit={handleAddSentiment}
      />
    </>
  );
}

export default AddSceneDialog; 