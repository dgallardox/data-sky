import React from 'react';
import { Paper, Box, Typography, Grid, List, ListItem, ListItemText, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';

const Dashboard = ({ status }) => {
  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#F44336', fontSize: 20 }} />;
      default:
        return <PendingIcon sx={{ color: '#FFA726', fontSize: 20 }} />;
    }
  };
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" sx={{ color: '#4A90E2', mb: 2 }}>
            System Status
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Active Scrapers
              </Typography>
              <Typography variant="h4" sx={{ color: '#2C3E50' }}>
                {status?.scrapers_count || 0}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last Run
              </Typography>
              <Typography variant="body1">
                {formatTime(status?.last_run)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" sx={{ color: '#4A90E2', mb: 2 }}>
            Registered Scrapers
          </Typography>
          
          {status?.scrapers?.length > 0 ? (
            <List>
              {status.scrapers.map((scraper, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText primary={scraper} />
                  <Chip label="Ready" size="small" color="primary" variant="outlined" />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No scrapers registered yet
            </Typography>
          )}
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#4A90E2', mb: 2 }}>
            Recent Results
          </Typography>
          
          {status?.last_results?.length > 0 ? (
            <List>
              {status.last_results.map((result, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    {getStatusIcon(result.status)}
                    <ListItemText 
                      primary={result.scraper}
                      secondary={`${result.data_count || 0} items • ${formatTime(result.timestamp)}`}
                    />
                    <Chip 
                      label={result.status} 
                      size="small" 
                      color={result.status === 'success' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No scraping results yet
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;