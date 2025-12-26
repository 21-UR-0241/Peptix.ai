
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Info,
  User,
  Camera,
  Sparkles,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';

function Results() {
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [activeTab, setActiveTab] = useState('scan');
  const [view, setView] = useState('problems');
  const [historySaved, setHistorySaved] = useState(false);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    const storedImage = sessionStorage.getItem('uploadedImage');
    if (storedResult) setAnalysisResult(JSON.parse(storedResult));
    if (storedImage) setProfileImage(storedImage);
  }, []);

  useEffect(() => {
    if (analysisResult?.analysis?.mainIssues?.length === 0) {
      setView('solutions');
    }
  }, [analysisResult]);

  // Save to history when component loads
  useEffect(() => {
    if (analysisResult && !historySaved) {
      saveToHistory(analysisResult);
      setHistorySaved(true);
    }
  }, [analysisResult, historySaved]);

  // Helper function to extract product name
  const extractProductName = (result) => {
    if (result?.analysis?.mainIssues?.length > 0) {
      return result.analysis.mainIssues[0].title || 'Health Analysis';
    }
    if (result?.peptides?.length > 0) {
      return 'Peptide Recommendations';
    }
    return 'Health Analysis';
  };

  // Helper function to calculate health score
  const calculateHealthScore = (result) => {
    const issuesCount = result?.analysis?.mainIssues?.length || 0;
    const achievedCount = result?.analysis?.alreadyAchieved?.length || 0;
    
    let score = 70 - (issuesCount * 10) + (achievedCount * 5);
    return Math.max(0, Math.min(100, score));
  };

  // Format analysis for storage
  const formatAnalysisForHistory = (result) => {
    let text = '';
    
    if (result?.analysis?.mainIssues?.length > 0) {
      text += '🔴 Problems Found:\n';
      result.analysis.mainIssues.forEach((issue, idx) => {
        text += `${idx + 1}. ${issue.title}: ${issue.detail}\n`;
      });
      text += '\n';
    }
    
    if (result?.analysis?.alreadyAchieved?.length > 0) {
      text += '✅ Already Achieved:\n';
      result.analysis.alreadyAchieved.forEach((achievement, idx) => {
        text += `${idx + 1}. ${achievement.title}: ${achievement.detail}\n`;
      });
      text += '\n';
    }
    
    if (result?.peptides?.length > 0) {
      text += '💊 Recommendations:\n';
      
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

  // Save to history database with Cloudinary URL
  const saveToHistory = async (result) => {
    try {
      // Check if already saved
      const alreadySaved = sessionStorage.getItem('historySaved');
      if (alreadySaved === 'true') {
        console.log('ℹ️ History already saved, skipping duplicate...');
        return;
      }

      // Get Cloudinary URL from the analysis result
      const cloudinaryUrl = result.imageUrl;
      
      if (!cloudinaryUrl) {
        console.warn('⚠️ No Cloudinary URL found in analysis result');
        return;
      }

      const productName = extractProductName(result);
      const healthScore = calculateHealthScore(result);
      const analysisText = formatAnalysisForHistory(result);

      console.log('💾 Saving to history with Cloudinary URL...');
      console.log('📷 Cloudinary URL:', cloudinaryUrl);

      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          productName,
          analysis: analysisText,
          imageUrl: cloudinaryUrl, // Use Cloudinary URL instead of base64
          healthScore
        })
      });

      if (response.ok) {
        console.log('✅ Analysis saved to history with Cloudinary URL');
        sessionStorage.setItem('historySaved', 'true');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save history:', errorData);
      }
    } catch (error) {
      console.error('❌ Error saving to history:', error);
    }
  };

if (!analysisResult) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#9ca3af' }}>No analysis results found.</p>

        <button
          onClick={() => {
            sessionStorage.removeItem('analysisResult');
            sessionStorage.removeItem('uploadedImage');
            sessionStorage.removeItem('historySaved');
            window.location.replace('/');
          }}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#a78bfa',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Start New Scan
        </button>

        <a
          href="/scan"
          style={{
            display: 'block',
            marginTop: '1rem',
            color: '#a78bfa',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Or click here to go home
        </a>
      </div>
    </div>
  );
}

  const { analysis = {}, peptides = [] } = analysisResult;
  const { alreadyAchieved = [], mainIssues = [] } = analysis;

  const groupedRecommendations = peptides.reduce((acc, peptide) => {
    const category = peptide.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(peptide);
    return acc;
  }, {});
  const recommendations = Object.entries(groupedRecommendations).map(
    ([category, items]) => ({ category, items })
  );

  const handleNewScan = () => {
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('uploadedImage');
    sessionStorage.removeItem('historySaved');
    sessionStorage.removeItem('imagePublicId');
    window.location.replace('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#ffffff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '1.5rem',
        paddingBottom: '6rem',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: 0,
          }}
        >
          Your Results
        </h1>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User size={20} />
        </div>
      </div>

      {/* New scan button */}
      <button
        onClick={handleNewScan}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          cursor: 'pointer',
          marginBottom: '2rem',
          padding: '0.5rem 0',
        }}
      >
        <ArrowLeft size={20} />
        New scan
      </button>

      {/* PROBLEMS VIEW */}
      {view === 'problems' && (
        <div
          style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
            }}
          >
            Problems found
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            Here's what our analysis detected:
          </p>
          {mainIssues.length === 0 && (
            <div style={{ color: '#9ca3af' }}>No problems detected.</div>
          )}
          {mainIssues.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '0.75rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                !
              </div>
              <div>
                <div
                  style={{
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                  }}
                >
                  {item.title}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}
          >
            <button
              onClick={() => setView('solutions')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#8b5cf6',
                border: 'none',
                color: '#fff',
                borderRadius: '999px',
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Next
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* SOLUTIONS VIEW */}
      {view === 'solutions' && (
        <div
          style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
            }}
          >
            But there's hope
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Here's what you can do about it:
          </p>
          
          {/* Profile Image - Use Cloudinary URL or fallback to base64 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                padding: '3px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#2a2a2a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {(analysisResult.imageUrl || profileImage) ? (
                  <img
                    src={analysisResult.imageUrl || profileImage}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <User size={40} color="#666" />
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <button
              onClick={() => setView('problems')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#2a2a2a',
                border: 'none',
                color: '#fff',
                borderRadius: '999px',
                padding: '0.6rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>

          {/* Already Achieved Section */}
          {alreadyAchieved.length > 0 && (
            <>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                }}
              >
                Already Achieved
              </h3>
              {alreadyAchieved.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>✓</span>
                  </div>
                  <div>
                    <div
                      style={{
                        color: '#10b981',
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        color: '#9ca3af',
                        fontSize: '0.875rem',
                      }}
                    >
                      {item.detail}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Recommendations */}
          {recommendations.map((category, idx) => (
            <div key={idx} style={{ marginTop: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#a78bfa',
                  }}
                ></span>
                {category.category}
              </h3>
              {category.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        color: '#a78bfa',
                        fontSize: '0.875rem',
                      }}
                    >
                      {item.description || item.benefits?.[0] || ''}
                    </div>
                  </div>
                  <Info size={20} color="#666" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Scan Another Photo Button */}
      <button
        onClick={handleNewScan}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'transparent',
          border: '2px solid #2a2a2a',
          borderRadius: '12px',
          color: '#a78bfa',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '2rem',
        }}
      >
        Scan another photo
      </button>

      {/* Bottom Navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid #1f2937',
          background: 'black',
          padding: '0.5rem 0',
        }}
      >
        <div
          style={{
            maxWidth: '28rem',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          {[
            { id: 'scan', icon: Camera, label: 'scan', path: '/' },
            { id: 'extras', icon: Sparkles, label: 'extras', path: '/extras' },
            { id: 'daily', icon: CheckCircle, label: 'daily', path: '/daily' },
            { id: 'coach', icon: MessageCircle, label: 'coach', path: '/coach' },
          ].map(({ id, icon: Icon, label, path }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (path === '/') {
                  handleNewScan();
                } else {
                  navigate(path);
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem 1.5rem',
                background: 'none',
                border: 'none',
                color: activeTab === id ? '#a855f7' : '#6b7280',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              <Icon size={24} strokeWidth={1.5} />
              <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Results;