import React, { useState } from 'react';
import { Paper, Box, Typography, Grid, List, ListItem, ListItemText, Chip, IconButton, Tooltip, CircularProgress, Tabs, Tab } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StorageIcon from '@mui/icons-material/Storage';
import api from '../services/api';
import ScraperCard from './ScraperCard';
import ScraperConfigModal from './ScraperConfigModal';
import ScraperIconDisplay from './ScraperIconDisplay';
import AIInsights from './AIInsights';

const Dashboard = ({ status, onRefresh, onAnalysisComplete, latestAnalysis }) => {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedScraper, setSelectedScraper] = useState(null);
  const [analyzingFiles, setAnalyzingFiles] = useState(new Set());
  const [analysisStatus, setAnalysisStatus] = useState(new Map()); // filename -> {exists, analyzed_at, etc}
  const [currentTab, setCurrentTab] = useState(0);
  
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
  
  // Check analysis status for all files when status updates
  React.useEffect(() => {
    const checkAnalysisStatus = async () => {
      if (!status?.last_results) return;
      
      const newAnalysisStatus = new Map();
      
      for (const result of status.last_results) {
        if (result.filename && (result.status === 'success' || result.status === 'partial_success')) {
          try {
            const response = await api.get(`/analysis/status/${result.filename}`);
            newAnalysisStatus.set(result.filename, response.data);
          } catch (error) {
            // If endpoint fails, assume no analysis exists
            newAnalysisStatus.set(result.filename, { exists: false });
          }
        }
      }
      
      setAnalysisStatus(newAnalysisStatus);
    };
    
    checkAnalysisStatus();
  }, [status?.last_results]);
  
  const handleAnalyzeResults = async (filename) => {
    const analysisInfo = analysisStatus.get(filename);
    
    // Switch to AI Analysis tab for both cached and new analysis
    setCurrentTab(1);
    
    // If analysis already exists, load from cache
    if (analysisInfo?.exists) {
      try {
        const response = await api.get(`/analysis/${analysisInfo.analysis_filename}`);
        if (onAnalysisComplete) {
          onAnalysisComplete({
            analysis: response.data.insights,
            stats: response.data.stats,
            filename: analysisInfo.analysis_filename
          });
        }
        return;
      } catch (error) {
        console.error('Failed to load cached analysis:', error);
        // Fall through to run new analysis
      }
    }
    
    // Run new analysis
    setAnalyzingFiles(prev => new Set([...prev, filename]));
    
    try {
      // Get selected model from localStorage or use default
      const selectedModel = localStorage.getItem('data_sky_ai_model') || 'qwen2.5:14b';
      
      const response = await api.post(`/analyze/${filename}`, {
        model: selectedModel
      });
      
      if (response.data.success) {
        // Update analysis status cache
        setAnalysisStatus(prev => {
          const newMap = new Map(prev);
          newMap.set(filename, {
            exists: true,
            analysis_filename: response.data.filename,
            analyzed_at: new Date().toISOString(),
            stats: response.data.stats
          });
          return newMap;
        });
        
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
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Data Collection Panel (current dashboard content)
  const DataCollectionPanel = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#4A90E2', mb: 2 }}>
            Registered Scrapers
          </Typography>
          
          {status?.scrapers?.length > 0 ? (
            <Grid container spacing={2}>
              {status.scrapers.map((scraper) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={scraper.name}>
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
                        <Tooltip title={
                          analysisStatus.get(result.filename)?.exists 
                            ? "View AI Analysis (cached)" 
                            : "Analyze with AI"
                        }>
                          <IconButton 
                            size="small" 
                            onClick={() => handleAnalyzeResults(result.filename)}
                            disabled={analyzingFiles.has(result.filename)}
                            sx={{ 
                              color: analysisStatus.get(result.filename)?.exists ? '#4A90E2' : '#757575',
                              '&:hover': { 
                                color: analysisStatus.get(result.filename)?.exists ? '#2E7CD6' : '#FFA726' 
                              },
                              '&:disabled': { color: '#ccc' }
                            }}
                          >
                            {analyzingFiles.has(result.filename) ? (
                              <CircularProgress size={16} sx={{ color: '#FFA726' }} />
                            ) : (
                              <PsychologyIcon 
                                fontSize="small" 
                                sx={{ 
                                  fontWeight: analysisStatus.get(result.filename)?.exists ? 'bold' : 'normal'
                                }}
                              />
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
  );

  // AI Analysis Panel with full-width AI Insights
  const AIAnalysisPanel = () => {
    // Show empty state if no analysis available
    if (!latestAnalysis?.analysis) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <PsychologyIcon sx={{ fontSize: 64, color: '#4A90E2', mb: 2, mx: 'auto' }} />
              <Typography variant="h5" sx={{ color: '#4A90E2', mb: 2 }}>
                AI Analysis Platform
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Advanced analytics and business intelligence
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Historical data analysis • Cross-source insights • Trend tracking
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Click the brain icon (🧠) on any Recent Result to see AI analysis here
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      );
    }

    // Show full-width AI insights when analysis is available
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, minHeight: '600px' }}>
            <Typography variant="h6" sx={{ color: '#4A90E2', mb: 2 }}>
              AI Insights
            </Typography>
            <AIInsights 
              status={status} 
              onAnalyze={() => {}} 
              latestAnalysis={latestAnalysis}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
    {/* Tab Navigation */}
    <Paper sx={{ mb: 3 }}>
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        sx={{ 
          borderBottom: '1px solid #e0e0e0',
          '& .MuiTab-root': {
            minHeight: 64,
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 500
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#4A90E2',
            height: 3
          }
        }}
      >
        <Tab 
          icon={<StorageIcon />} 
          label="Data Collection" 
          iconPosition="start"
          sx={{ 
            color: currentTab === 0 ? '#4A90E2' : '#757575',
            '&.Mui-selected': { color: '#4A90E2' }
          }}
        />
        <Tab 
          icon={<PsychologyIcon />} 
          label="AI Analysis" 
          iconPosition="start"
          sx={{ 
            color: currentTab === 1 ? '#4A90E2' : '#757575',
            '&.Mui-selected': { color: '#4A90E2' }
          }}
        />
      </Tabs>
    </Paper>

    {/* Tab Content */}
    {currentTab === 0 && <DataCollectionPanel />}
    {currentTab === 1 && <AIAnalysisPanel />}
    
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