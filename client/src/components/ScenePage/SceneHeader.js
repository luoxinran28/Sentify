import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import { DensityMedium } from '@mui/icons-material';

function SceneHeader({ menuItems = [] }) {
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
            {menuItems.map((item, index) => (
              <MenuItem 
                key={index}
                onClick={() => handleMenuItemClick(item.onClick)}
              >
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