import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Camera,
  Info,
  CheckCircle,
  MessageCircle,
  File,
  User2Icon,
} from 'lucide-react';

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('scan');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/scan') {
      setActiveTab('scan');
    } else if (path === '/about') {
      setActiveTab('about');
    } else if (path === '/history') {
      setActiveTab('history');
    } else if (path === '/profile') {
      setActiveTab('profile');
    } else if (path === '/results') {
      setActiveTab('scan');
    }
  }, [location.pathname]);

  const handleNavigation = (id, path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid #1f2937',
        background: 'black',
        padding: '0.35rem 0',
        zIndex: 1000,
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
          { id: 'scan', icon: Camera, label: 'Scan', path: '/scan' },
          { id: 'about', icon: Info, label: 'About', path: '/about' },
          { id: 'history', icon: File, label: 'History', path: '/history' },
          { id: 'profile', icon: User2Icon, label: 'Profile', path: '/profile' },
        ].map(({ id, icon: Icon, label, path }) => (
          <button
            key={id}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation(id, path);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.15rem',
              padding: '0.35rem 1.1rem',
              background: 'none',
              border: 'none',
              color: activeTab === id ? '#9333ea' : '#6b7280',
              cursor: 'pointer',
              transition: 'color 0.2s',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Icon size={22} strokeWidth={1.5} />
            <span style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;