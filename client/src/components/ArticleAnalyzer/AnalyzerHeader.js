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
  Clear as ClearIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function AnalyzerHeader({ onUpload, onClearCache, sceneTitle, currentTab, onTabChange, onAddArticle }) {
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

  const handleAddArticle = () => {
    handleClose();
    onAddArticle();
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        minHeight: 64,
        px: 2
      }}>
        {/* 左侧区域 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
        <Box>
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            <MenuItem onClick={handleAddArticle}>
              <AddIcon sx={{ mr: 1 }} />
              添加文章
            </MenuItem>
            <MenuItem onClick={handleUpload}>
              <UploadIcon sx={{ mr: 1 }} />
              批量上传
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