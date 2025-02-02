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
  Tab,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Apps as AppsIcon,
  Upload as UploadIcon,
  Clear as ClearIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const GradientHeader = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'box-shadow 0.3s ease-in-out',
  padding: theme.spacing(1, 2),
  height: 64,
  display: 'flex',
  alignItems: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -32,
    height: 32,
    background: 'linear-gradient(rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
    zIndex: 10
  }
}));

function AnalyzerHeader({ onUpload, onClear, currentTab = 'articles', onTabChange }) {
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
    onClear();
  };

  return (
    <GradientHeader>
      <Toolbar sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        minHeight: 64,
        width: '100%',
        px: 2,
        position: 'relative'
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
            sx={{ padding: 0 }}
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
      
    </GradientHeader>
  );
}

AnalyzerHeader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  sceneTitle: PropTypes.string,
  currentTab: PropTypes.oneOf(['articles', 'overview', 'analysis']),
  onTabChange: PropTypes.func.isRequired
};

export default AnalyzerHeader; 