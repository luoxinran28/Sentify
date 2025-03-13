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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import axiosInstance from '../../../services/axiosInstance';
import AddSentimentDialog from './AddSentimentDialog';

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
    prompt: '',
    sentiments: []
  });
  const [errors, setErrors] = useState({});
  const [availableSentiments, setAvailableSentiments] = useState([]);
  const [scenarioSentiments, setScenarioSentiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addSentimentDialogOpen, setAddSentimentDialogOpen] = useState(false);

  // 获取所有可用的情感类型
  useEffect(() => {
    if (open) {
      setLoading(true);
      
      // 获取所有情感类型
      axiosInstance.get('/scenarios/sentiments')
        .then(response => {
          console.log('获取情感类型成功:', response.data);
          setAvailableSentiments(response.data);
        })
        .catch(error => {
          console.error('获取情感类型失败:', error);
        });
      
      // 如果有场景ID，获取该场景的情感类型
      if (scene?.id) {
        axiosInstance.get(`/scenarios/${scene.id}/sentiments`)
          .then(response => {
            console.log('获取场景情感类型成功:', response.data);
            setScenarioSentiments(response.data);
            setFormData(prev => ({
              ...prev,
              sentiments: response.data.map(s => s.id)
            }));
          })
          .catch(error => {
            console.error('获取场景情感类型失败:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  }, [open, scene?.id]);

  useEffect(() => {
    if (scene) {
      setFormData({
        titleEn: scene.titleEn || '',
        titleZh: scene.titleZh || '',
        source: scene.source || '',
        prompt: scene.prompt || '',
        sentiments: scenarioSentiments.map(s => s.id)
      });
    }
  }, [scene, scenarioSentiments]);

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
    if (formData.sentiments.length === 0) {
      newErrors.sentiments = '请至少选择一种情感类型';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        id: scene.id
      });
    }
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
            {/* <StyledTextField
              label="Prompt"
              fullWidth
              multiline
              rows={4}
              value={formData.prompt}
              onChange={handleChange('prompt')}
            /> */}
            
            <FormControl fullWidth error={!!errors.sentiments} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InputLabel id="edit-sentiments-label">情感类型</InputLabel>
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
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2">加载情感类型...</Typography>
                </Box>
              ) : (
                <>
                  <Select
                    labelId="edit-sentiments-label"
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
                    {availableSentiments.map((sentiment) => (
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
                    ))}
                  </Select>
                  {errors.sentiments && (
                    <FormHelperText>{errors.sentiments}</FormHelperText>
                  )}
                </>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                选择此场景可用的情感类型，分析结果将基于这些类型进行分类
              </Typography>
            </FormControl>
            
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

      <AddSentimentDialog 
        open={addSentimentDialogOpen}
        onClose={() => setAddSentimentDialogOpen(false)}
        onSubmit={handleAddSentiment}
      />
    </>
  );
};

export default EditSceneDialog; 