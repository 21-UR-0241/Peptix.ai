import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Info,
  User,
  LogOut,
  UserCircle,
} from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { authService } from '../services/auth.js';
import { historyService } from '../services/history.js';

function Results() {
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [view, setView] = useState('problems');
  const [historySaved, setHistorySaved] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setShowDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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

  useEffect(() => {
    if (analysisResult && !historySaved) {
      saveToHistory(analysisResult);
      setHistorySaved(true);
    }
  }, [analysisResult, historySaved]);

  const extractProductName = (result) => {
    if (result?.analysis?.mainIssues?.length > 0) {
      return result.analysis.mainIssues[0].title || 'Health Analysis';
    }
    if (result?.peptides?.length > 0) {
      return 'Peptide Recommendations';
    }
    return 'Health Analysis';
  };

  const calculateHealthScore = (result) => {
    const issuesCount = result?.analysis?.mainIssues?.length || 0;
    const achievedCount = result?.analysis?.alreadyAchieved?.length || 0;
    
    let score = 70 - (issuesCount * 10) + (achievedCount * 5);
    return Math.max(0, Math.min(100, score));
  };

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

  const saveToHistory = async (result) => {
    try {
      const alreadySaved = sessionStorage.getItem('historySaved');
      if (alreadySaved === 'true') {
        console.log('ℹ️ History already saved, skipping duplicate...');
        return;
      }

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

      await historyService.saveHistory(
        productName,
        analysisText,
        cloudinaryUrl,
        healthScore
      );

      console.log('✅ Analysis saved to history with Cloudinary URL');
      sessionStorage.setItem('historySaved', 'true');
    } catch (error) {
      console.error('❌ Error saving to history:', error);
    }
  };
  

  if (!analysisResult) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', margin: 0 }}>No analysis results found.</p>
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
    window.location.replace('/scan');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          flex: 1,
          paddingBottom: '5rem',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '1.5rem',
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

            {/* User Profile / Auth Button */}
            {!loading && (
              <div style={{ position: 'relative' }}>
                {user ? (
                  <>
                    <div
                      onClick={() => setShowDropdown(!showDropdown)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: showDropdown ? '0 0 0 3px rgba(139, 92, 246, 0.3)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = showDropdown ? '0 0 0 3px rgba(139, 92, 246, 0.3)' : 'none';
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        background: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '12px',
                        minWidth: '220px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        zIndex: 1000,
                      }}>
                        {/* User Info */}
                        <div style={{
                          padding: '1rem',
                          borderBottom: '1px solid #2a2a2a',
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
                        }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            margin: '0 auto 0.75rem',
                          }}>
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div style={{ 
                            fontWeight: '600', 
                            color: '#ffffff', 
                            marginBottom: '0.25rem',
                            textAlign: 'center',
                            fontSize: '1rem',
                          }}>
                            {user.name || 'User'}
                          </div>
                          <div style={{ 
                            color: '#9ca3af',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                          }}>
                            {user.email}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/profile');
                          }}
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: '500',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(167, 139, 250, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <UserCircle size={18} />
                          My Profile
                        </button>

                        <button
                          onClick={handleLogout}
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            borderTop: '1px solid #2a2a2a',
                            color: '#ef4444',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: '500',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <LogOut size={18} />
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    onClick={() => navigate('/login')}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <User size={20} />
                  </div>
                )}
              </div>
            )}
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
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
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
                  margin: '0 0 0.5rem 0',
                }}
              >
                Problems found
              </h2>
              <p style={{ color: '#9ca3af', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' }}>
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
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
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
                  margin: '0 0 0.5rem 0',
                }}
              >
                But there's hope
              </h2>
              <p style={{ color: '#9ca3af', marginBottom: '2rem', margin: '0 0 2rem 0' }}>
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
                    width: '150px',
                    height: '150px',
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
                    transition: 'transform 0.2s ease, background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = '#3a3a3a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = '#2a2a2a';
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
                      margin: '0 0 1rem 0',
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
                      margin: '0 0 1rem 0',
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

         {/* Scan Another Photo Button with Hover Animation */}
              <button
                onClick={handleNewScan}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#8b5cf6',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '2rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 0 rgba(167, 139, 250, 0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(167, 139, 250, 0.5)';
                  e.currentTarget.style.background = '#9333ea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 0 rgba(167, 139, 250, 0)';
                  e.currentTarget.style.background = '#8b5cf6';
                }}
              >
                Scan another photo
              </button>
        </div>
      </main>

      {/* Bottom Navigation Component */}
      <BottomNavigation />

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          onClick={() => setShowDropdown(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}

export default Results;