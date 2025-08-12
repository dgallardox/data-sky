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
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { serverAPI } from '../services/api';

const ScraperConfigModal = ({ open, onClose, scraperName, onSave }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('');
  
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
  
  if (!config) {
    return null;
  }
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Configure Reddit Scraper</Typography>
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
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#4A90E2' }}>
            Subreddits
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
          </Box>
          
          <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#F5F8FA', borderRadius: 1 }}>
            {config.subreddits.map((subreddit) => (
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
            {config.subreddits.length === 0 && (
              <ListItem>
                <ListItemText 
                  primary="No subreddits configured"
                  secondary="Add subreddits to start scraping"
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            )}
          </List>
        </Box>
        
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
        
        <Box sx={{ mb: 2 }}>
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
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`${config.subreddits.length} subreddits`} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`${config.subreddits.length * config.posts_per_subreddit} total posts max`} 
            size="small" 
            variant="outlined" 
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading || config.subreddits.length === 0}
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScraperConfigModal;