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
import { DensityMedium, Edit as EditIcon } from '@mui/icons-material';

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

  const handleEditClick = () => {
    handleClose();
    onToggleEdit();
  };

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
            <MenuItem 
              onClick={handleEditClick}
              sx={{
                color: isEditing ? 'text.secondary' : 'inherit'
              }}
            >
              <EditIcon sx={{ mr: 1, fontSize: 20 }} />
              {isEditing ? '退出编辑' : '编辑场景'}
            </MenuItem>
            <Divider />
            {menuItems.map((item, index) => (
              <MenuItem 
                key={index}
                onClick={() => handleMenuItemClick(item.onClick)}
                disabled={isEditing && item.disabledInEdit}
              >
                {item.icon && <item.icon sx={{ mr: 1, fontSize: 20 }} />}
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default SceneHeader; 