import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Apps as AppsIcon,
  Upload as UploadIcon,
  DeleteSweep as ClearIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

function AnalyzerHeader({ onUpload, onClearCache, sceneTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { previousPath } = location.state || { previousPath: '/' };
  const [anchorEl, setAnchorEl] = useState(null);

  const handleBack = () => {
    navigate(previousPath);
  };

  const handleToolsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpload = () => {
    handleClose();
    onUpload();
  };

  const handleClearCache = () => {
    handleClose();
    onClearCache();
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

        {/* 工具菜单 */}
        <Box>
          <IconButton
            color="inherit"
            onClick={handleToolsClick}
            size="large"
          >
            <AppsIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleUpload}>
              <UploadIcon sx={{ mr: 1 }} />
              上传评论
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClearCache}>
              <ClearIcon sx={{ mr: 1 }} />
              清空数据
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AnalyzerHeader; 