import React, { useState } from 'react';
import {
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import useScrollCompact from '../../../../hooks/useScrollCompact';

const GradientHeader = styled(Paper)(({ theme, iscompact }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease-in-out',
  padding: theme.spacing(1, 2),
  height: iscompact === 'true' ? '40px' : '64px',
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

const StyledToolbar = styled(Toolbar)(({ theme, iscompact }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  alignItems: 'center',
  minHeight: iscompact === 'true' ? '40px' : '64px',
  width: '100%',
  padding: iscompact === 'true' ? theme.spacing(0, 2) : theme.spacing(0, 2),
  position: 'relative',
  transition: 'all 0.3s ease-in-out'
}));

const StyledTabs = styled(Tabs)(({ theme, iscompact }) => ({
  minHeight: iscompact === 'true' ? '40px' : '48px',
  transition: 'all 0.3s ease-in-out',
  '& .MuiTab-root': {
    minHeight: iscompact === 'true' ? '40px' : '48px',
    transition: 'all 0.3s ease-in-out',
    color: 'rgba(0, 0, 0, 0.42)',
    '&.Mui-selected': {
      color: 'rgba(0, 0, 0, 0.87)'
    }
  },
  '& .MuiTabs-indicator': {
    backgroundColor: 'rgba(0, 0, 0, 0.87)'
  }
}));

function AnalyzerHeader({ onUpload, onClear, currentTab = 'articles', onTabChange }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isCompact = useScrollCompact(50);

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
    <GradientHeader iscompact={isCompact.toString()}>
      <StyledToolbar iscompact={isCompact.toString()}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            sx={{ color: 'rgba(0, 0, 0, 0.87)' }}
            aria-label="back"
            onClick={handleBack}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Box>
          <StyledTabs 
            value={currentTab} 
            onChange={onTabChange}
            iscompact={isCompact.toString()}
          >
            <Tab label="文章" value="articles" />
            <Tab label="概要" value="overview" />
            <Tab label="分析" value="analysis" />
          </StyledTabs>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            sx={{ 
              padding: 0,
              color: 'rgba(0, 0, 0, 0.87)'
            }}
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
              <UploadIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.87)' }} />
              批量上传
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClearCache}>
              <ClearIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.87)' }} />
              清空数据
            </MenuItem>
          </Menu>
        </Box>
      </StyledToolbar>
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