import React, { useState } from 'react';
import { Paper, Box, Typography, Grid, List, ListItem, ListItemText, Chip, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ScraperCard from './ScraperCard';
import ScraperConfigModal from './ScraperConfigModal';

const Dashboard = ({ status, onRefresh }) => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedScraper, setSelectedScraper] = useState(null);
  
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
  
  const handleViewResults = (filename) => {
    // Open JSON in new tab
    window.open(`http://localhost:5001/api/results/${filename}`, '_blank');
  };
  
  const handleDownloadResults = (filename) => {
    // Trigger file download
    window.open(`http://localhost:5001/api/results/${filename}/download`, '_blank');
  };
  
  return (
    <>
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
            <Grid container spacing={2}>
              {status.scrapers.map((scraper) => (
                <Grid item xs={12} key={scraper.name}>
                  <ScraperCard 
                    scraper={scraper}
                    onConfigClick={(name) => {
                      setSelectedScraper(name);
                      setConfigModalOpen(true);
                    }}
                    onRefresh={onRefresh}
                  />
                </Grid>
              ))}
            </Grid>
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
                    
                    {/* View and Download buttons - only show for successful scrapes */}
                    {result.status === 'success' && result.filename && (
                      <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                        <Tooltip title="View results">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewResults(result.filename)}
                            sx={{ 
                              color: '#757575',
                              '&:hover': { color: '#4A90E2' }
                            }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Download JSON">
                          <IconButton 
                            size="small"
                            onClick={() => handleDownloadResults(result.filename)}
                            sx={{ 
                              color: '#757575',
                              '&:hover': { color: '#4A90E2' }
                            }}
                          >
                            <DownloadOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    
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
    
    <ScraperConfigModal
      open={configModalOpen}
      onClose={() => {
        setConfigModalOpen(false);
        setSelectedScraper(null);
      }}
      scraperName={selectedScraper}
      onSave={() => {
        onRefresh();
      }}
    />
    </>
  );
};

export default Dashboard;