import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Switch, 
  Chip,
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RedditIcon from '@mui/icons-material/Reddit';
import TwitterIcon from '@mui/icons-material/Twitter';
import PublicIcon from '@mui/icons-material/Public';
import { serverAPI } from '../services/api';

const ScraperCard = ({ scraper, onConfigClick, onRefresh }) => {
  const [enabled, setEnabled] = useState(scraper.enabled);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'reddit':
        return <RedditIcon sx={{ fontSize: 30, color: '#FF4500' }} />;
      case 'twitter':
        return <TwitterIcon sx={{ fontSize: 30, color: '#1DA1F2' }} />;
      default:
        return <PublicIcon sx={{ fontSize: 30, color: '#4A90E2' }} />;
    }
  };
  
  const handleToggle = async () => {
    setLoading(true);
    try {
      await serverAPI.toggleScraper(scraper.name, !enabled);
      setEnabled(!enabled);
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle scraper:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRunNow = async () => {
    setRunning(true);
    try {
      const response = await serverAPI.runScraper(scraper.name);
      if (response.data.status === 'success') {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to run scraper:', error);
    } finally {
      setRunning(false);
    }
  };
  
  const formatLastRun = (lastRun) => {
    if (!lastRun) return 'Never';
    const date = new Date(lastRun);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            {getIcon(scraper.icon)}
            <Box>
              <Typography variant="h6" sx={{ color: '#2C3E50' }}>
                {scraper.display_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {scraper.name === 'reddit' && scraper.subreddits_count ? `${scraper.subreddits_count} subreddits` : 
                 scraper.name === 'twitter' && scraper.search_queries_count ? `${scraper.search_queries_count} search queries` :
                 'Not configured'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Configure">
              <IconButton 
                size="small" 
                onClick={() => onConfigClick(scraper.name)}
                disabled={loading}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={enabled ? 'Disable' : 'Enable'}>
              <Switch
                checked={enabled}
                onChange={handleToggle}
                disabled={loading}
                size="small"
              />
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Last run
            </Typography>
            <Typography variant="body2">
              {formatLastRun(scraper.last_run)}
            </Typography>
          </Box>
          
          {scraper.posts_per_subreddit && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Posts limit
              </Typography>
              <Typography variant="body2">
                {scraper.posts_per_subreddit} per subreddit
              </Typography>
            </Box>
          )}
          
          {scraper.max_results_per_query && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Results limit
              </Typography>
              <Typography variant="body2">
                {scraper.max_results_per_query} per query
              </Typography>
            </Box>
          )}
          
          {scraper.time_window && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Time window
              </Typography>
              <Typography variant="body2">
                Last {scraper.time_window}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={running ? <CircularProgress size={16} /> : <PlayArrowIcon />}
            onClick={handleRunNow}
            disabled={!enabled || running || loading}
            fullWidth
          >
            {running ? 'Running...' : 'Run Now'}
          </Button>
          
          {enabled ? (
            <Chip label="Active" color="success" size="small" variant="outlined" />
          ) : (
            <Chip label="Inactive" color="default" size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ScraperCard;