

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';
import { authService } from '../services/auth.js'; // Add this import

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      // Updated to use authService
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
      // Updated to use authService
      await authService.logout();
      setUser(null);
      setShowDropdown(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header style={{
      background: '#0a0a0a',
      borderBottom: '1px solid #2a2a2a',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(10, 10, 10, 0.95)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: '700',
            gap: '0.5rem'
          }}
        >
          <AnimatedLogo size={40} />
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            PEPTIX
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          {[
            { path: '/scan', label: 'Home' },
            { path: '/analyze', label: 'Analyze' },
            { path: '/history', label: 'History' },
            { path: '/about', label: 'About' }
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  background: isActive ? '#a78bfa' : 'transparent',
                  color: isActive ? '#ffffff' : '#9ca3af',
                  border: isActive ? 'none' : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#ffffff';
                    e.target.style.background = 'rgba(167, 139, 250, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#9ca3af';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* User Profile / Auth */}
          {!loading && (
            <>
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(167, 139, 250, 0.1)',
                      border: '1px solid #a78bfa',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
                    }}
                  >
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: '700'
                    }}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                    <span>{user.name || user.email}</span>
                    <span style={{ fontSize: '0.7rem' }}>▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      right: 0,
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      minWidth: '200px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                      overflow: 'hidden',
                      zIndex: 1000
                    }}>
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #2a2a2a',
                        color: '#9ca3af',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '0.25rem' }}>
                          {user.name}
                        </div>
                        <div>{user.email}</div>
                      </div>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/profile');
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        👤 Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
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
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                    color: '#ffffff',
                    border: 'none',
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
                  Login
                </Link>
              )}
            </>
          )}
        </nav>
      </div>

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
            zIndex: 999
          }}
        />
      )}
    </header>
  );
}

export default Header;