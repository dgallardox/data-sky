import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Chip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const Header = ({ isOnline, onSettingsClick }) => {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#4A90E2' }}>
      <Toolbar>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 500, letterSpacing: 0.5 }}>
          Data Sky
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={isOnline ? 'Scheduler Active' : 'Scheduler Inactive'}
            color={isOnline ? 'success' : 'error'}
            size="small"
            sx={{ fontWeight: 500 }}
          />
          
          <IconButton 
            color="inherit" 
            onClick={onSettingsClick}
            sx={{ 
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;