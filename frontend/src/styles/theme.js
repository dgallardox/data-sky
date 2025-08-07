import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2',
      light: '#7BB3F0',
      dark: '#2E7CD6',
    },
    secondary: {
      main: '#87CEEB',
      light: '#B0E0F3',
      dark: '#5BA3C7',
    },
    background: {
      default: '#F5F8FA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
      color: '#2C3E50',
    },
    h6: {
      fontWeight: 500,
      color: '#4A90E2',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

export default theme;