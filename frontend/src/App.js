import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Container, Box, CssBaseline, Alert, Snackbar } from '@mui/material';
import theme from './styles/theme';
import Header from './components/Header';
import ServerControl from './components/ServerControl';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import { serverAPI } from './services/api';

function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  const fetchStatus = async () => {
    try {
      const response = await serverAPI.getStatus();
      setStatus(response.data);
      setIsOnline(response.data.is_running);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setNotification({ open: true, message: 'Failed to connect to server', severity: 'error' });
    }
  };
  
  useEffect(() => {
    fetchStatus();
    
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const handleToggleServer = async () => {
    setIsLoading(true);
    try {
      if (isOnline) {
        await serverAPI.stopServer();
        setNotification({ open: true, message: 'Server stopped', severity: 'success' });
      } else {
        await serverAPI.startServer();
        setNotification({ open: true, message: 'Server started', severity: 'success' });
      }
      await fetchStatus();
    } catch (error) {
      console.error('Failed to toggle server:', error);
      setNotification({ open: true, message: 'Failed to toggle server', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRunNow = async () => {
    setIsLoading(true);
    try {
      const response = await serverAPI.runNow();
      setNotification({ open: true, message: 'Scraping completed', severity: 'success' });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to run scrapers:', error);
      setNotification({ open: true, message: 'Failed to run scrapers', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F8FA' }}>
        <Header 
          isOnline={isOnline} 
          onSettingsClick={() => setSettingsOpen(true)} 
        />
        
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ServerControl
            isRunning={isOnline}
            onToggle={handleToggleServer}
            onRunNow={handleRunNow}
            isLoading={isLoading}
          />
          
          <Dashboard status={status} onRefresh={fetchStatus} />
        </Container>
        
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
        
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setNotification({ ...notification, open: false })} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;