import React from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const SettingsModal = ({ open, onClose }) => {
  
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