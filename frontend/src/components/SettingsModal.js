import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import api from '../services/api';

const SettingsModal = ({ open, onClose }) => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('qwen2.5:14b');
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchModels = async () => {
    setLoadingModels(true);
    setError(null);
    try {
      const response = await api.get('/analysis/models');
      setModels(response.data.models || []);
    } catch (err) {
      setError('Failed to fetch Ollama models. Make sure Ollama is running.');
      console.error('Failed to fetch models:', err);
    } finally {
      setLoadingModels(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      fetchModels();
    }
  }, [open]);
  
  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
    // Save to localStorage for persistence
    localStorage.setItem('data_sky_ai_model', event.target.value);
  };
  
  useEffect(() => {
    // Load saved model from localStorage
    const savedModel = localStorage.getItem('data_sky_ai_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, backgroundColor: '#F5F8FA' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#4A90E2' }}>
            Settings
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: '#7F8C8D' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <InfoOutlinedIcon sx={{ color: '#4A90E2' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Server Configuration
            </Typography>
          </Box>
          
          <Box sx={{ pl: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Backend Port: <Chip label="8937" size="small" variant="outlined" />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Frontend Port: <Chip label="8936" size="small" variant="outlined" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              API Endpoint: <Chip label="http://localhost:8937/api" size="small" variant="outlined" />
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>>
            <PsychologyIcon sx={{ color: '#FFA726' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              AI Analysis Settings
            </Typography>
          </Box>
          
          <Box sx={{ pl: 4 }}>
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>AI Model</InputLabel>
              <Select
                value={selectedModel}
                label="AI Model"
                onChange={handleModelChange}
                disabled={loadingModels}
              >
                {loadingModels ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      Loading models...
                    </Box>
                  </MenuItem>
                ) : models.length > 0 ? (
                  models.map((model) => (
                    <MenuItem key={model.name} value={model.name}>
                      <Box>
                        <Typography variant="body2">{model.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {model.size_gb}GB • {model.category}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      No models available - install Ollama models first
                    </Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
            
            <Typography variant="caption" color="text.secondary">
              This model will be used for analyzing scraped data to identify opportunities and trends.
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
            About Data Sky
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Data Sky is an automated web scraping platform that collects data from various sources
            to identify product opportunities and user needs. Configure scrapers to run automatically
            or trigger them manually as needed.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, backgroundColor: '#F5F8FA' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ 
            backgroundColor: '#4A90E2',
            '&:hover': { backgroundColor: '#2E7CD6' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;