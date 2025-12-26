

import React, { useState } from 'react';
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

function PeptideResultsUI({
  problems = [],         // NEW: list of problems found
  alreadyAchieved = [],
  recommendations = [],
  profileImage = null,
}) {
  const [view, setView] = useState('problems'); // 'problems' | 'solutions'
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(recommendations.length / itemsPerPage);
  const currentItems = recommendations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#ffffff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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

      {/* --- VIEW: PROBLEMS FOUND --- */}
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
            Here’s what our analysis detected:
          </p>

          {problems.length === 0 && (
            <div style={{ color: '#9ca3af' }}>No problems detected.</div>
          )}

          {problems.map((item, idx) => (
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

          {/* Right arrow to move to “hope” view */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
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

      {/* --- VIEW: HOPE + RECOMMENDATIONS --- */}
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
            But there’s hope
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Here’s what you can do about it:
          </p>

          {/* Profile Image (placeholder or user image) */}
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
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={40} color="#666" />
                )}
              </div>
            </div>
          </div>

          {/* Already Achieved */}
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
                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      {item.detail}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Recommendations (paginated) */}
          {currentItems.map((category, idx) => (
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
                    <div style={{ color: '#a78bfa', fontSize: '0.875rem' }}>
                      {item.description}
                    </div>
                  </div>
                  <Info size={20} color="#666" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '2rem',
              }}
            >
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#2a2a2a',
                  border: 'none',
                  color: currentPage === 0 ? '#666' : '#fff',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ←
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#2a2a2a',
                  border: 'none',
                  color: currentPage === totalPages - 1 ? '#666' : '#fff',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scan Another Photo Button */}
      <button
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
            { id: 'scan', icon: Camera, label: 'scan' },
            { id: 'extras', icon: Sparkles, label: 'extras' },
            { id: 'daily', icon: CheckCircle, label: 'daily' },
            { id: 'coach', icon: MessageCircle, label: 'coach' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              // Replace with your active-tab handler if needed:
              // onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem 1.5rem',
                background: 'none',
                border: 'none',
                color: '#6b7280',
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

export default PeptideResultsUI;