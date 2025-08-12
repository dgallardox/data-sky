import React from 'react';
import { Box, Avatar } from '@mui/material';
import RedditIcon from '@mui/icons-material/Reddit';
import TwitterIcon from '@mui/icons-material/Twitter';
import PublicIcon from '@mui/icons-material/Public';

const ScraperIconDisplay = ({ scrapers, status, size = 'small' }) => {
  // Filter out invalid scraper names and ensure we have at least one
  const validScrapers = scrapers.filter(scraper => 
    scraper && typeof scraper === 'string' && scraper !== 'Run All'
  );
  
  // If no valid scrapers, show a generic icon
  if (validScrapers.length === 0) {
    validScrapers.push('generic');
  }
  const getScraperIcon = (scraperName) => {
    const iconProps = {
      fontSize: size === 'small' ? 16 : 20,
      color: '#ffffff'
    };

    switch(scraperName) {
      case 'reddit':
        return <RedditIcon sx={iconProps} />;
      case 'twitter':
        return <TwitterIcon sx={iconProps} />;
      default:
        return <PublicIcon sx={iconProps} />;
    }
  };

  const getScraperColor = (scraperName) => {
    switch(scraperName) {
      case 'reddit':
        return '#FF4500';
      case 'twitter':
        return '#1DA1F2';
      default:
        return '#4A90E2';
    }
  };

  const getStatusTint = (status) => {
    switch(status) {
      case 'success':
        return 1; // Full opacity
      case 'partial_success':
        return 0.8; // Slightly dimmed for partial success
      case 'error':
        return 0.6; // Dimmed for error
      case 'pending':
        return 0.4; // Very dim for pending
      default:
        return 1;
    }
  };

  const getStatusBorder = (status) => {
    switch(status) {
      case 'success':
        return '2px solid #4CAF50';
      case 'partial_success':
        return '2px solid #FFA726';
      case 'error':
        return '2px solid #F44336';
      default:
        return '2px solid #ffffff';
    }
  };

  const avatarSize = size === 'small' ? 28 : 36;
  const overlapOffset = size === 'small' ? -8 : -12;

  // Single scraper - just show one icon
  if (validScrapers.length === 1) {
    const scraper = validScrapers[0];
    return (
      <Avatar
        sx={{
          width: avatarSize,
          height: avatarSize,
          backgroundColor: getScraperColor(scraper),
          opacity: getStatusTint(status),
          border: getStatusBorder(status)
        }}
      >
        {getScraperIcon(scraper)}
      </Avatar>
    );
  }

  // Multiple scrapers - Audi-style overlapping circles
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      position: 'relative',
      width: avatarSize + (validScrapers.length - 1) * Math.abs(overlapOffset),
      height: avatarSize
    }}>
      {validScrapers.map((scraper, index) => (
        <Avatar
          key={`${scraper}-${index}`}
          sx={{
            width: avatarSize,
            height: avatarSize,
            backgroundColor: getScraperColor(scraper),
            opacity: getStatusTint(status),
            border: getStatusBorder(status),
            position: 'absolute',
            left: index * Math.abs(overlapOffset),
            zIndex: validScrapers.length - index, // First scraper on top
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {getScraperIcon(scraper)}
        </Avatar>
      ))}
    </Box>
  );
};

export default ScraperIconDisplay;