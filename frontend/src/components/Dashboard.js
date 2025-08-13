import React, { useState } from 'react';
import { Paper, Box, Typography, Grid, List, ListItem, ListItemText, Chip, IconButton, Tooltip, CircularProgress } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import api from '../services/api';
import ScraperCard from './ScraperCard';
import ScraperConfigModal from './ScraperConfigModal';
import ScraperIconDisplay from './ScraperIconDisplay';
import AIInsights from './AIInsights';

const Dashboard = ({ status, onRefresh, onAnalysisComplete, latestAnalysis }) => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedScraper, setSelectedScraper] = useState(null);
  const [analyzingFiles, setAnalyzingFiles] = useState(new Set());
  
  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  
  const getScraperIcon = (result) => {
    // For batch runs (Run All), show all scrapers that ran
    if (result.run_type === 'batch' && result.scrapers) {
      return (
        <ScraperIconDisplay 
          scrapers={result.scrapers}
          status={result.status}
          size="small"
        />
      );
    }
    
    // For individual scraper runs, show just that scraper
    return (
      <ScraperIconDisplay 
        scrapers={[result.scraper]}
        status={result.status}
        size="small"
      />
    );
  };
  
  const handleViewResults = (filename) => {
    // Open JSON in new tab
    window.open(`http://localhost:8937/api/results/${filename}`, '_blank');
  };
  
  const handleDownloadResults = (filename) => {
    // Trigger file download
    window.open(`http://localhost:8937/api/results/${filename}/download`, '_blank');
  };
  
  const handleAnalyzeResults = async (filename) => {
    // Add to analyzing set
    setAnalyzingFiles(prev => new Set([...prev, filename]));
    
    try {
      // Get selected model from localStorage or use default
      const selectedModel = localStorage.getItem('data_sky_ai_model') || 'qwen2.5:14b';
      
      const response = await api.post(`/analyze/${filename}`, {
        model: selectedModel
      });
      
      if (response.data.success) {
        // Notify parent component that analysis is complete
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data);
        }
      } else {
        console.error('Analysis failed:', response.data.error);
        alert(`Analysis failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Analysis request failed:', error);
      alert('Analysis request failed. Please check if Ollama is running.');
    } finally {
      // Remove from analyzing set
      setAnalyzingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(filename);
        return newSet;
      });
    }
  };
  
  return (
    <>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" sx={{ color: '#4A90E2', mb: 2 }}>
            AI Insights
          </Typography>
          
          <AIInsights status={status} onAnalyze={() => {}} latestAnalysis={latestAnalysis} />
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
              {[...status.last_results].reverse().map((result, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    {getScraperIcon(result)}
                    <ListItemText 
                      primary={result.scraper}
                      secondary={`${result.data_count || 0} items • ${formatTime(result.timestamp)}`}
                    />
                    
                    {/* Action buttons - show for successful and partial success scrapes */}
                    {(result.status === 'success' || result.status === 'partial_success') && result.filename && (
                      <Box sx={{ display: 'flex', gap: 0.5, mr: 1 }}>
                        <Tooltip title="Analyze with AI">
                          <IconButton 
                            size="small" 
                            onClick={() => handleAnalyzeResults(result.filename)}
                            disabled={analyzingFiles.has(result.filename)}
                            sx={{ 
                              color: '#757575',
                              '&:hover': { color: '#FFA726' },
                              '&:disabled': { color: '#ccc' }
                            }}
                          >
                            {analyzingFiles.has(result.filename) ? (
                              <CircularProgress size={16} sx={{ color: '#FFA726' }} />
                            ) : (
                              <PsychologyIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        
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
                      label={result.status === 'partial_success' ? 'partial' : result.status} 
                      size="small" 
                      color={
                        result.status === 'success' ? 'success' : 
                        result.status === 'partial_success' ? 'warning' : 'error'
                      }
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