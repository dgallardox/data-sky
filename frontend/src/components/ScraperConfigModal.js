import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { serverAPI } from '../services/api';

const ScraperConfigModal = ({ open, onClose, scraperName, onSave }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('');
  const [newSearchQuery, setNewSearchQuery] = useState('');
  const [showToken, setShowToken] = useState(false);
  
  useEffect(() => {
    if (open && scraperName) {
      fetchConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scraperName]);
  
  const fetchConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await serverAPI.getScraperConfig(scraperName);
      setConfig(response.data);
    } catch (error) {
      setError('Failed to load configuration');
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await serverAPI.updateScraperConfig(scraperName, config);
      onSave();
      onClose();
    } catch (error) {
      setError('Failed to save configuration');
      console.error('Failed to save config:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSubreddit = () => {
    if (newSubreddit && !config.subreddits.includes(newSubreddit)) {
      setConfig({
        ...config,
        subreddits: [...config.subreddits, newSubreddit.toLowerCase().replace(/[^a-z0-9_]/g, '')]
      });
      setNewSubreddit('');
    }
  };
  
  const handleRemoveSubreddit = (subreddit) => {
    setConfig({
      ...config,
      subreddits: config.subreddits.filter(s => s !== subreddit)
    });
  };
  
  const handlePostsLimitChange = (event, value) => {
    setConfig({
      ...config,
      posts_per_subreddit: value
    });
  };
  
  const handleSortChange = (event) => {
    setConfig({
      ...config,
      sort_by: event.target.value
    });
  };
  
  // Twitter-specific handlers
  const handleAddSearchQuery = () => {
    if (newSearchQuery && !config.search_queries?.includes(newSearchQuery)) {
      setConfig({
        ...config,
        search_queries: [...(config.search_queries || []), newSearchQuery]
      });
      setNewSearchQuery('');
    }
  };
  
  const handleRemoveSearchQuery = (query) => {
    setConfig({
      ...config,
      search_queries: config.search_queries.filter(q => q !== query)
    });
  };
  
  const handleTimeWindowChange = (event) => {
    setConfig({
      ...config,
      time_window: event.target.value
    });
  };
  
  const handleTokenChange = (event) => {
    setConfig({
      ...config,
      bearer_token: event.target.value
    });
  };
  
  if (!config) {
    return null;
  }
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Configure {scraperName === 'reddit' ? 'Reddit' : 'Twitter/X'} Scraper
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Twitter Bearer Token */}
        {scraperName === 'twitter' && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Bearer Token"
              type={showToken ? 'text' : 'password'}
              value={config.bearer_token || ''}
              onChange={handleTokenChange}
              helperText="Get from developer.twitter.com"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowToken(!showToken)}
                      edge="end"
                      size="small"
                    >
                      {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#4A90E2' }}>
            {scraperName === 'reddit' ? 'Subreddits' : 'Search Queries'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {scraperName === 'reddit' ? (
              <>
                <TextField
                  size="small"
                  placeholder="Add subreddit (e.g., python)"
                  value={newSubreddit}
                  onChange={(e) => setNewSubreddit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubreddit()}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleAddSubreddit}
                  startIcon={<AddIcon />}
                  disabled={!newSubreddit}
                >
                  Add
                </Button>
              </>
            ) : (
              <>
                <TextField
                  size="small"
                  placeholder='Add search query (e.g., "I wish there was")'
                  value={newSearchQuery}
                  onChange={(e) => setNewSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSearchQuery()}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={handleAddSearchQuery}
                  startIcon={<AddIcon />}
                  disabled={!newSearchQuery}
                >
                  Add
                </Button>
              </>
            )}
          </Box>
          
          <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#F5F8FA', borderRadius: 1 }}>
            {scraperName === 'reddit' ? (
              <>
                {config.subreddits?.map((subreddit) => (
                  <ListItem key={subreddit}>
                    <ListItemText 
                      primary={`r/${subreddit}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => handleRemoveSubreddit(subreddit)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {(!config.subreddits || config.subreddits.length === 0) && (
                  <ListItem>
                    <ListItemText 
                      primary="No subreddits configured"
                      secondary="Add subreddits to start scraping"
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
              </>
            ) : (
              <>
                {config.search_queries?.map((query) => (
                  <ListItem key={query}>
                    <ListItemText 
                      primary={query}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => handleRemoveSearchQuery(query)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {(!config.search_queries || config.search_queries.length === 0) && (
                  <ListItem>
                    <ListItemText 
                      primary="No search queries configured"
                      secondary="Add queries to find tweets"
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                )}
              </>
            )}
          </List>
        </Box>
        
        {scraperName === 'reddit' ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#4A90E2' }}>
              Posts per Subreddit: {config.posts_per_subreddit}
            </Typography>
            <Slider
              value={config.posts_per_subreddit}
              onChange={handlePostsLimitChange}
              min={10}
              max={100}
              step={5}
              marks={[
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 75, label: '75' },
                { value: 100, label: '100' }
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#4A90E2' }}>
              Results per Query: {config.max_results_per_query}
            </Typography>
            <Slider
              value={config.max_results_per_query || 10}
              onChange={(e, value) => setConfig({ ...config, max_results_per_query: value })}
              min={5}
              max={50}
              step={5}
              marks={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' }
              ]}
              valueLabelDisplay="auto"
            />
          </Box>
        )}
        
        <Box sx={{ mb: 2 }}>
          {scraperName === 'reddit' ? (
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={config.sort_by}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="hot">Hot</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="top">Top</MenuItem>
                <MenuItem value="rising">Rising</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth size="small">
              <InputLabel>Time Window</InputLabel>
              <Select
                value={config.time_window || '24h'}
                onChange={handleTimeWindowChange}
                label="Time Window"
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="3d">Last 3 Days</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {scraperName === 'reddit' ? (
            <>
              <Chip 
                label={`${config.subreddits?.length || 0} subreddits`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`${(config.subreddits?.length || 0) * (config.posts_per_subreddit || 0)} total posts max`} 
                size="small" 
                variant="outlined" 
              />
            </>
          ) : (
            <>
              <Chip 
                label={`${config.search_queries?.length || 0} search queries`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`${(config.search_queries?.length || 0) * (config.max_results_per_query || 10)} tweets max`} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={`Free tier: 50 requests/day`} 
                size="small" 
                color="warning" 
                variant="outlined" 
              />
            </>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading || 
            (scraperName === 'reddit' ? (!config.subreddits || config.subreddits.length === 0) : 
             (!config.search_queries || config.search_queries.length === 0 || !config.bearer_token))
          }
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScraperConfigModal;