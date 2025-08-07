import React from 'react';
import { Paper, Box, Typography, Switch, Button, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const ServerControl = ({ isRunning, onToggle, onRunNow, isLoading }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#4A90E2' }}>
          Server Control
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Auto-Scraping
          </Typography>
          <Switch
            checked={isRunning}
            onChange={onToggle}
            disabled={isLoading}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#4CAF50',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#4CAF50',
              },
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
          onClick={onRunNow}
          disabled={isLoading || !isRunning}
          sx={{ 
            backgroundColor: '#4A90E2',
            '&:hover': { backgroundColor: '#2E7CD6' }
          }}
        >
          Run Now
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          {isRunning ? 'Automatic scraping scheduled daily at 12:00 PM' : 'Automatic scraping disabled'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ServerControl;