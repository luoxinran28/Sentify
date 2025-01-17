import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Box,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Upload as UploadIcon,
  DeleteSweep as ClearIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { clearAuthStatus } from '../utils/auth';

function Header({ onLogout, onUpload, onClearCache }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearAuthStatus();
    handleClose();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        {/* 左侧菜单按钮 */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuClick}
        >
          <MenuIcon />
        </IconButton>
        
        {/* 下拉菜单 */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
        >
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            退出登录
          </MenuItem>
        </Menu>

        {/* 标题 */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          评论分析系统
        </Typography>

        {/* 右侧按钮组 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="上传批量评论">
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
              onClick={onUpload}
            >
              批量上传
            </Button>
          </Tooltip>

          <Tooltip title="清空缓存数据">
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              size="small"
              onClick={onClearCache}
            >
              清空缓存
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 