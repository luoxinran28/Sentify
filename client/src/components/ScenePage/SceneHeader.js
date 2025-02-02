import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Divider
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
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sentify
        </Typography>
        <Box>
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