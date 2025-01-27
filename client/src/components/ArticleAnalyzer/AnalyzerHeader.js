import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Apps as AppsIcon,
  Upload as UploadIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

function AnalyzerHeader({ onUpload, onClearCache, sceneTitle, currentTab, onTabChange }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleBack = () => {
    navigate('/');
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
      <Box sx={{ position: 'relative' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* 左侧区域 */}
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', left: 16 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={handleBack}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2 }}>
              {sceneTitle}
            </Typography>
          </Box>

          {/* 中间的 Tabs */}
          <Box sx={{ 
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1
          }}>
            <Tabs 
              value={currentTab} 
              onChange={onTabChange}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="文章" value="articles" />
              <Tab label="概要" value="overview" />
              <Tab label="分析" value="analysis" />
            </Tabs>
          </Box>

          {/* 右侧工具菜单 */}
          <Box sx={{ position: 'absolute', right: 0 }}>
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
                上传内容
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClearCache}>
                <ClearIcon sx={{ mr: 1 }} />
                清空数据
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  );
}

export default AnalyzerHeader; 