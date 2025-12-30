import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';
import analyzeImageWithAI from '../services/aiService';
import { historyService } from '../services/history.js'; // Add this

function Analyze() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('scan');

  const NAV_HEIGHT = 62;

  const navItems = useMemo(
    () => [
      { id: 'scan', icon: Camera, label: 'scan', path: '/scan' },
      { id: 'extras', icon: Sparkles, label: 'extras', path: '/extras' },
      { id: 'daily', icon: CheckCircle, label: 'daily', path: '/daily' },
      { id: 'coach', icon: MessageCircle, label: 'coach', path: '/coach' },
    ],
    [],
  );

  useEffect(() => {
    const map = {
      '/scan': 'scan',
      '/extras': 'extras',
      '/daily': 'daily',
      '/coach': 'coach',
    };
    setActiveTab(map[location.pathname] || 'scan');
  }, [location.pathname]);

  const handleNewScan = () => {
    setMode(null);
    setError(null);
    setIsAnalyzing(false);
  };

  // 🔥 NEW: Helper function to extract product name from analysis
  const extractProductName = (result) => {
    // Try to extract from mainIssues or peptides
    if (result?.analysis?.mainIssues?.length > 0) {
      return result.analysis.mainIssues[0].title || 'Health Analysis';
    }
    if (result?.peptides?.length > 0) {
      return 'Peptide Recommendations';
    }
    return 'Health Analysis';
  };

  // 🔥 NEW: Helper function to calculate a health score
  const calculateHealthScore = (result) => {
    const issuesCount = result?.analysis?.mainIssues?.length || 0;
    const achievedCount = result?.analysis?.alreadyAchieved?.length || 0;
    
    // Simple scoring: start at 70, subtract 10 per issue, add 5 per achievement
    let score = 70 - (issuesCount * 10) + (achievedCount * 5);
    
    // Keep score between 0-100
    return Math.max(0, Math.min(100, score));
  };

    // 🔥 NEW: Function to save analysis to history
  const saveToHistory = async (analysisResult, imageBase64) => {
    try {
      const productName = extractProductName(analysisResult);
      const healthScore = calculateHealthScore(analysisResult);
      
      // Create a readable analysis text
      const analysisText = formatAnalysisForHistory(analysisResult);

      const response = await fetch('http://localhost:3001/api/history', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for sending cookies
        body: JSON.stringify({
          productName,
          analysis: analysisText,
          imageUrl: imageBase64,
          healthScore
        })
      });

      if (!response.ok) {
        console.error('Failed to save history:', await response.text());
      } else {
        console.log('✅ Analysis saved to history');
      }
    } catch (error) {
      console.error('❌ Error saving to history:', error);
      // Don't throw - history save failure shouldn't break the analysis flow
    }
  };

// // 🔥 NEW: Function to save analysis to history
//   const saveToHistory = async (analysisResult, imageBase64) => {
//     try {
//       const productName = extractProductName(analysisResult);
//       const healthScore = calculateHealthScore(analysisResult);
      
//       // Create a readable analysis text
//       const analysisText = formatAnalysisForHistory(analysisResult);

//       // Updated to use historyService
//       await historyService.saveHistory(
//         productName,
//         analysisText,
//         imageBase64,
//         healthScore
//       );

//       console.log('✅ Analysis saved to history');
//     } catch (error) {
//       console.error('❌ Error saving to history:', error);
//       // Don't throw - history save failure shouldn't break the analysis flow
//     }
//   };

  // 🔥 NEW: Format analysis result into readable text
  const formatAnalysisForHistory = (result) => {
    let text = '';
    
    // Add main issues
    if (result?.analysis?.mainIssues?.length > 0) {
      text += '🔴 Problems Found:\n';
      result.analysis.mainIssues.forEach((issue, idx) => {
        text += `${idx + 1}. ${issue.title}: ${issue.detail}\n`;
      });
      text += '\n';
    }
    
    // Add achievements
    if (result?.analysis?.alreadyAchieved?.length > 0) {
      text += '✅ Already Achieved:\n';
      result.analysis.alreadyAchieved.forEach((achievement, idx) => {
        text += `${idx + 1}. ${achievement.title}: ${achievement.detail}\n`;
      });
      text += '\n';
    }
    
    // Add recommendations
    if (result?.peptides?.length > 0) {
      text += '💊 Recommendations:\n';
      
      // Group by category
      const grouped = result.peptides.reduce((acc, peptide) => {
        const category = peptide.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(peptide);
        return acc;
      }, {});
      
      Object.entries(grouped).forEach(([category, peptides]) => {
        text += `\n${category}:\n`;
        peptides.forEach((peptide, idx) => {
          text += `  ${idx + 1}. ${peptide.name}`;
          if (peptide.description) {
            text += ` - ${peptide.description}`;
          }
          text += '\n';
        });
      });
    }
    
    return text.trim() || 'Analysis completed successfully.';
  };

  const handleImageAnalysis = async (imageFile) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      const imageBase64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });

      // Wait for image conversion
      const imageBase64 = await imageBase64Promise;
      
      // Store in sessionStorage for display
      sessionStorage.setItem('uploadedImage', imageBase64);

      // Analyze the image
      const result = await analyzeImageWithAI(imageFile);

      if (!result || !Array.isArray(result.peptides) || result.peptides.length === 0) {
        throw new Error('No valid recommendations received from AI');
      }

      // Store analysis result in sessionStorage
      sessionStorage.setItem('analysisResult', JSON.stringify(result));

      // 🔥 SAVE TO HISTORY DATABASE
      await saveToHistory(result, imageBase64);

      // Navigate to results page
      navigate('/results');
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err?.message || 'Failed to analyze image. Please try again.');
      setIsAnalyzing(false);
      setMode(null);
    }
  };

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    setError(null);
  };

  if (isAnalyzing) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#0a0a0a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            border: '4px solid #2a2a2a',
            borderTop: '4px solid #a78bfa',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: '1rem', fontSize: '1.05rem', fontWeight: 650, marginBottom: 6 }}>
          Analyzing your image...
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
          This may take 10–30 seconds
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0a0a0a',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main content area (CENTERED) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          paddingBottom: `calc(${NAV_HEIGHT}px + 12px)`,
          overflowY: 'auto',
        }}
      >
        {/* Inner container */}
        <div style={{ width: '100%', maxWidth: 520 }}>
          {/* Header */}
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 750, margin: 0 }}>
              Analyze Your Health & Fitness
            </h1>
            <p style={{ color: '#9ca3af', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>
              Upload an image for AI-powered peptide recommendations
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 14,
                padding: '0.9rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={20} color="#ef4444" style={{ marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.95rem' }}>
                  Error
                </div>
                <div style={{ color: '#fca5a5', marginTop: 6, fontSize: '0.9rem' }}>
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Mode selection */}
          {!mode && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => handleModeSelection('camera')}
                style={{
                  background: '#121212',
                  border: '1px solid #2a2a2a',
                  borderRadius: 14,
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                <Camera size={44} color="#a78bfa" />
                <div style={{ marginTop: 10, fontWeight: 750, fontSize: '1rem' }}>
                  Use Camera
                </div>
                <div style={{ marginTop: 6, color: '#9ca3af', fontSize: '0.85rem' }}>
                  Take a photo
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeSelection('upload')}
                style={{
                  background: '#121212',
                  border: '1px solid #2a2a2a',
                  borderRadius: 14,
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                <Upload size={44} color="#ec4899" />
                <div style={{ marginTop: 10, fontWeight: 750, fontSize: '1rem' }}>
                  Upload Image
                </div>
                <div style={{ marginTop: 6, color: '#9ca3af', fontSize: '0.85rem' }}>
                  Choose from gallery
                </div>
              </button>
            </div>
          )}

          {/* Capture/Upload flows */}
          {mode === 'camera' && (
            <CameraCapture onCapture={handleImageAnalysis} onClose={() => setMode(null)} />
          )}
          {mode === 'upload' && (
            <ImageUpload onUpload={handleImageAnalysis} onClose={() => setMode(null)} />
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: NAV_HEIGHT,
          borderTop: '1px solid #1f2937',
          background: 'black',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '28rem',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          {navItems.map(({ id, icon: Icon, label, path }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                if (path === '/scan') {
                  handleNewScan();
                  navigate('/scan');
                } else {
                  navigate(path);
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '0.35rem 0.9rem',
                background: 'none',
                border: 'none',
                color: activeTab === id ? '#a855f7' : '#6b7280',
                cursor: 'pointer',
              }}
            >
              <Icon size={22} />
              <span style={{ fontSize: '0.72rem', lineHeight: 1 }}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Analyze;