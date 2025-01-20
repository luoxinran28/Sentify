import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  DeleteSweep as ClearIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

function AnalyzerHeader({ onUpload, onClearCache, sceneTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { previousPath } = location.state || { previousPath: '/' };

  const handleBack = () => {
    navigate(previousPath);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {/* 返回按钮 */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="back"
          onClick={handleBack}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* 标题 */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
          {sceneTitle}
        </Typography>

        {/* 右侧按钮组 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="清空当前场景数据">
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              size="small"
              onClick={onClearCache}
            >
              清空数据
            </Button>
          </Tooltip>

          <Tooltip title="上传评论">
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
              onClick={onUpload}
            >
              上传
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AnalyzerHeader; 