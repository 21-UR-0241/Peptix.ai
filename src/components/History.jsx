import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setHistory(history.filter(item => item.id !== id));
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  // Optimize Cloudinary image URL with transformations
  const getOptimizedImageUrl = (url, transformation = 'thumbnail') => {
    if (!url) return null;
    
    // Check if it's a Cloudinary URL
    if (!url.includes('cloudinary.com')) return url;

    const transformations = {
      thumbnail: 'w_400,h_300,c_fill,q_auto,f_auto',
      modal: 'w_800,h_600,c_limit,q_auto,f_auto',
      full: 'q_auto,f_auto'
    };

    // Insert transformation into Cloudinary URL
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    return url.slice(0, uploadIndex + 8) + 
           transformations[transformation] + '/' + 
           url.slice(uploadIndex + 8);
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const filterHistory = () => {
    const now = new Date();
    const filtered = history.filter(item => {
      const itemDate = new Date(item.createdAt);
      
      switch (filter) {
        case 'today':
          return itemDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return itemDate >= monthAgo;
        default:
          return true;
      }
    });
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const filteredHistory = filterHistory();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid #2a2a2a',
            borderTop: '4px solid #9333ea ',
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
        <div style={{ fontSize: '1.2rem' }}>Loading history...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white'
    }}>
      <main style={{
        flex: 1,
        paddingBottom: '5rem', // Space for bottom navigation
        overflowY: 'auto'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem 1.5rem'
        }}>
          {/* Header */}
          <div style={{
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem',
                margin: 0
              }}>
                Analysis History
              </h1>
              <p style={{
                color: '#9ca3af',
                fontSize: '1rem',
                margin: '0.5rem 0 0 0'
              }}>
                {filteredHistory.length} {filteredHistory.length === 1 ? 'entry' : 'entries'} found
              </p>
            </div>

            {/* Filter Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              background: '#1a1a1a',
              padding: '0.25rem',
              borderRadius: '8px',
              border: '1px solid #2a2a2a'
            }}>
              {['all', 'today', 'week', 'month'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: filter === f ? '#9333ea' : 'transparent',
                    color: filter === f ? '#ffffff' : '#9ca3af',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== f) {
                      e.target.style.background = 'rgba(167, 139, 250, 0.1)';
                      e.target.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== f) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#9ca3af';
                    }
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* History Grid */}
          {filteredHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                📋
              </div>
              <h3 style={{
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                margin: 0
              }}>
                No history found
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '1rem',
                marginBottom: '1.5rem',
                margin: '0.5rem 0 1.5rem 0'
              }}>
                Start analyzing to build your history
              </p>
              <button
                onClick={() => navigate('/scan')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Start Analyzing
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#9333ea';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(167, 139, 250, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a2a';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Image with Cloudinary optimization */}
                  {item.imageUrl && !imageErrors[item.id] ? (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      overflow: 'hidden',
                      background: '#0a0a0a',
                      position: 'relative'
                    }}>
                      <img
                        src={getOptimizedImageUrl(item.imageUrl, 'thumbnail')}
                        alt="Analysis"
                        loading="lazy"
                        onError={() => handleImageError(item.id)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: '#0a0a0a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4b5563',
                      fontSize: '3rem'
                    }}>
                      📷
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '0.75rem'
                    }}>
                      <h3 style={{
                        color: '#ffffff',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        margin: 0,
                        flex: 1
                      }}>
                        {item.productName || 'Analysis'}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          marginLeft: '0.5rem',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    <p style={{
                      color: '#9ca3af',
                      fontSize: '0.85rem',
                      marginBottom: '0.75rem',
                      margin: '0 0 0.75rem 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {typeof item.analysis === 'string' 
                        ? item.analysis.substring(0, 120) 
                        : JSON.stringify(item.analysis).substring(0, 120)
                      }...
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        color: '#6b7280',
                        fontSize: '0.8rem'
                      }}>
                        {formatDate(item.createdAt)}
                      </span>
                      {item.healthScore && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: item.healthScore >= 70 
                            ? 'rgba(34, 197, 94, 0.1)' 
                            : item.healthScore >= 40 
                              ? 'rgba(251, 191, 36, 0.1)' 
                              : 'rgba(239, 68, 68, 0.1)',
                          color: item.healthScore >= 70 
                            ? '#22c55e' 
                            : item.healthScore >= 40 
                              ? '#fbbf24' 
                              : '#ef4444'
                        }}>
                          Score: {item.healthScore}/100
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <>
          <div
            onClick={() => setSelectedItem(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            maxWidth: '800px',
            maxHeight: '90vh',
            width: '90%',
            overflow: 'auto',
            zIndex: 1001,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #2a2a2a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: '#1a1a1a',
              zIndex: 10
            }}>
              <h2 style={{
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0
              }}>
                {selectedItem.productName || 'Analysis Details'}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#9ca3af';
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              {selectedItem.imageUrl && !imageErrors[selectedItem.id] && (
                <img
                  src={getOptimizedImageUrl(selectedItem.imageUrl, 'modal')}
                  alt="Analysis"
                  onError={() => handleImageError(selectedItem.id)}
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    background: '#0a0a0a'
                  }}
                />
              )}

              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#0a0a0a',
                borderRadius: '8px',
                border: '1px solid #2a2a2a'
              }}>
                <div style={{
                  color: '#9ca3af',
                  fontSize: '0.85rem',
                  marginBottom: '0.25rem'
                }}>
                  Analyzed on
                </div>
                <div style={{
                  color: '#ffffff',
                  fontSize: '1rem'
                }}>
                  {new Date(selectedItem.createdAt).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </div>
              </div>

              {selectedItem.healthScore && (
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: '#0a0a0a',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem'
                  }}>
                    Health Score
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: selectedItem.healthScore >= 70 
                      ? '#22c55e' 
                      : selectedItem.healthScore >= 40 
                        ? '#fbbf24' 
                        : '#ef4444'
                  }}>
                    {selectedItem.healthScore}/100
                  </div>
                </div>
              )}

              <div style={{
                color: '#ffffff',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {typeof selectedItem.analysis === 'string' 
                  ? selectedItem.analysis 
                  : JSON.stringify(selectedItem.analysis, null, 2)
                }
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation Component */}
      <BottomNavigation />
    </div>
  );
}

export default History;