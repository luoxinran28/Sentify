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
  alpha
} from '@mui/material';
import { 
  DensityMedium, 
  Edit as EditIcon,
  Add as AddIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

function SceneHeader({ menuItems = [], isEditing, onToggleEdit }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (onClick) => {
    handleClose();
    onClick?.();
  };

  // 将编辑选项也加入到菜单项数组中
  const allMenuItems = [
    {
      label: isEditing ? '退出编辑' : '编辑场景',
      icon: EditIcon,
      onClick: onToggleEdit,
      sx: {
        color: isEditing ? 'text.secondary' : 'inherit'
      }
    },
    {
      label: '添加场景',
      icon: AddIcon,
      onClick: () => menuItems.find(item => item.label === '添加场景')?.onClick(),
      disabledInEdit: true
    },
    { type: 'divider' },
    {
      label: '退出登录',
      icon: LogoutIcon,
      onClick: () => menuItems.find(item => item.label === '退出登录')?.onClick(),
      disabledInEdit: true
    }
  ];

  return (
    <AppBar 
      position="static" 
      elevation={1} 
      sx={{ 
        backgroundColor: '#020202',
        backgroundImage: `radial-gradient(${alpha('#fff', 0.1)} 1px, ${alpha('#051923', 0.95)} 1px)`,
        backgroundSize: '4px 4px',
        backdropFilter: 'blur(3px)',
        WebkitMaskImage: 'linear-gradient(to bottom, #ababab 18%, transparent)',
        maskImage: 'linear-gradient(to bottom, #ababab 18%, transparent)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'inherit',
          backdropFilter: 'blur(3px)',
          zIndex: -1
        }
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: '#fefefe',
            position: 'relative',
            zIndex: 1
          }}
        >
          Sentify
        </Typography>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <DensityMedium />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {allMenuItems.map((item, index) => (
              item.type === 'divider' ? (
                <Divider key={`divider-${index}`} />
              ) : (
                <MenuItem 
                  key={item.label}
                  onClick={() => handleMenuItemClick(item.onClick)}
                  disabled={isEditing && item.disabledInEdit}
                  sx={item.sx}
                >
                  {item.icon && <item.icon sx={{ mr: 1, fontSize: 20 }} />}
                  {item.label}
                </MenuItem>
              )
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default SceneHeader; 