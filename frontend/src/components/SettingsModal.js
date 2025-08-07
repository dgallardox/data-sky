import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SettingsModal = ({ open, onClose, currentPort, onPortChange }) => {
  const [selectedPort, setSelectedPort] = useState(currentPort);
  
  const availablePorts = [3000, 4000, 5001, 5002, 8000, 8080, 8888, 9000];
  
  useEffect(() => {
    setSelectedPort(currentPort);
  }, [currentPort]);
  
  const handleSave = () => {
    if (selectedPort !== currentPort) {
      onPortChange(selectedPort);
    }
    onClose();
  };
  
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
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="port-select-label">Server Port</InputLabel>
          <Select
            labelId="port-select-label"
            value={selectedPort}
            label="Server Port"
            onChange={(e) => setSelectedPort(e.target.value)}
          >
            {availablePorts.map((port) => (
              <MenuItem key={port} value={port}>
                {port}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Note: Changing the port will require restarting the server
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, backgroundColor: '#F5F8FA' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{ 
            backgroundColor: '#4A90E2',
            '&:hover': { backgroundColor: '#2E7CD6' }
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;