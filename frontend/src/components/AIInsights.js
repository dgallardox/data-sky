import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  LinearProgress,
  Alert,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const AIInsights = ({ status, onAnalyze, latestAnalysis }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState('opportunities');
  const [analysisSource, setAnalysisSource] = useState(null);

  // Mock data for demonstration - will be replaced with real AI analysis
  const mockInsights = {
    opportunities: [
      {
        title: "High demand for budget gaming keyboards",
        confidence: 0.85,
        sources: ['reddit', 'twitter'],
        evidence: "15 mentions in r/mechanicalkeyboards, trending on Twitter #gamingsetup"
      },
      {
        title: "Growing interest in AI-powered note-taking apps",
        confidence: 0.72,
        sources: ['reddit'],
        evidence: "23 requests in r/productivity over last 24h"
      }
    ],
    trends: [
      {
        topic: "Mechanical keyboards under $100",
        momentum: "rising",
        mentions: 42
      },
      {
        topic: "Open-source alternatives to Notion",
        momentum: "steady",
        mentions: 18
      }
    ],
    sentiment: {
      positive: 65,
      neutral: 25,
      negative: 10
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    // Simulate AI analysis - will be replaced with actual API call
    setTimeout(() => {
      setInsights(mockInsights);
      setLoading(false);
    }, 2000);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'default';
  };

  const getMomentumIcon = (momentum) => {
    if (momentum === 'rising') return '📈';
    if (momentum === 'falling') return '📉';
    return '➡️';
  };

  // Update insights when new analysis is available
  useEffect(() => {
    if (latestAnalysis?.analysis) {
      setInsights(latestAnalysis.analysis);
      setAnalysisSource({
        filename: latestAnalysis.filename,
        stats: latestAnalysis.stats
      });
      setError(null);
    }
  }, [latestAnalysis]);

  if (!insights && !loading) {
    return (
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 1,
        border: '1px dashed #ccc',
        textAlign: 'center'
      }}>
        <PsychologyIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No AI analysis available yet
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Click the brain icon (🧠) on any Recent Result to analyze
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Analyzing scraped data...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Product Opportunities */}
      <Box>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            mb: 1
          }}
          onClick={() => toggleSection('opportunities')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbOutlinedIcon sx={{ fontSize: 18, color: '#FFA726' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Opportunities ({insights.opportunities.length})
            </Typography>
          </Box>
          <IconButton size="small">
            {expandedSection === 'opportunities' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expandedSection === 'opportunities'}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {insights.opportunities.slice(0, 2).map((opp, index) => (
              <Card key={index} variant="outlined" sx={{ backgroundColor: '#fafafa' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {opp.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                    <Chip 
                      label={`${(opp.confidence * 100).toFixed(0)}% confidence`}
                      size="small"
                      color={getConfidenceColor(opp.confidence)}
                      variant="outlined"
                    />
                    {opp.sources.map(source => (
                      <Chip 
                        key={source}
                        label={source}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {opp.evidence}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Collapse>
      </Box>

      <Divider />

      {/* Trending Topics */}
      <Box>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            mb: 1
          }}
          onClick={() => toggleSection('trends')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Trending Topics
            </Typography>
          </Box>
          <IconButton size="small">
            {expandedSection === 'trends' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expandedSection === 'trends'}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {insights.trends.map((trend, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 1,
                backgroundColor: '#fafafa',
                borderRadius: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption">
                    {getMomentumIcon(trend.momentum)}
                  </Typography>
                  <Typography variant="body2">
                    {trend.topic}
                  </Typography>
                </Box>
                <Chip 
                  label={`${trend.mentions} mentions`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Analysis source info */}
      <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #eee' }}>
        {analysisSource && (
          <Typography variant="caption" color="text.secondary">
            Analysis of: {analysisSource.filename}
            {analysisSource.stats && (
              <span> • {analysisSource.stats.total_items} items • {analysisSource.stats.meaningful_clusters} clusters</span>
            )}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AIInsights;