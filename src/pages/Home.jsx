

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  X,
  LogOut,
  UserCircle,
  User,
} from 'lucide-react';
import AnimatedLogo from '../components/AnimatedLogo';
import BottomNavigation from '../components/BottomNavigation';
import analyzeImageWithAI from '../services/aiService';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { authService } from '../services/auth.js'; // Add this import

export default function PeptixHome() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const slides = [
    {
      title: 'Find your perfect peptide stack',
      subtitle:
        'AI analyzes skin tone, bone structure, body fat & facial harmony to recommend optimal peptides.',
    },
    {
      title: 'Personalized recommendations',
      subtitle:
        'Get tailored peptide stacks based on your unique biological markers and health goals.',
    },
    {
      title: 'Science-backed analysis',
      subtitle:
        'Our AI uses cutting-edge research to provide evidence-based peptide recommendations.',
    },
  ];

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
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) {
            setFileName('pasted-image.png');
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            setCapturedBlob(blob);
            setIsCameraActive(false);
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
              setStream(null);
            }
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [stream]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCapturedBlob(file);
    setIsCameraActive(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      setPreviewUrl(null);
      setFileName('');
      setCapturedBlob(null);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => console.error(err));
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert(
        `Unable to access camera: ${err.message}\n\nPlease check:\n- Camera permissions are granted\n- You are using HTTPS or localhost\n- Camera is not being used by another app`,
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setFileName('camera-capture.jpg');
        setCapturedBlob(blob);
        stopCamera();
      },
      'image/jpeg',
      0.95,
    );
  };

  const handleStartAnalysis = async () => {
    if (!capturedBlob && !previewUrl) {
      alert('Please capture or upload an image first');
      return;
    }
    setIsAnalyzing(true);
    try {
      console.log('📤 Uploading image to Cloudinary...');
      const cloudinaryResult = await uploadImageToCloudinary(capturedBlob);
      console.log('✅ Image uploaded:', cloudinaryResult.url);
      sessionStorage.setItem('uploadedImage', cloudinaryResult.url);
      sessionStorage.setItem('imagePublicId', cloudinaryResult.publicId);
      const result = await analyzeImageWithAI(capturedBlob);
      if (!result || !result.peptides || result.peptides.length === 0) {
        throw new Error('No valid recommendations received from AI');
      }
      
      result.imageUrl = cloudinaryResult.url;
      result.imagePublicId = cloudinaryResult.publicId;
      
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      navigate('/results');
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert(`Failed to analyze image: ${error.message}\n\nPlease try again.`);
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
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
            borderTop: '4px solid #9333ea',
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
        <p style={{ marginTop: '1.25rem', fontSize: '1.05rem', fontWeight: '600' }}>
          Analyzing your image...
        </p>
        <p style={{ color: '#9ca3af', marginTop: '0.35rem', fontSize: '0.9rem' }}>
          This may take 10-30 seconds
        </p>
      </div>
    );
  }

  const BTN_PAD_Y = '0.72rem';
  const BTN_FONT = '0.88rem';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          paddingBottom: '5rem',
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Logo Section - Above Preview Container */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 0.85rem 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AnimatedLogo size={50} />
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                PEPTIX
              </span>
            </div>

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
                        background: '#9333ea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: showDropdown ? '0 0 0 3px rgba(167, 139, 250, 0.3)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = showDropdown ? '0 0 0 3px rgba(167, 139, 250, 0.3)' : 'none';
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
                          background: 'rgba(167, 139, 250, 0.1)',
                        }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: '#9333ea',
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
                      background: '#9333ea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.4)';
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

          {/* Preview Area with Grid Lines */}
          <div
            style={{
              background: '#2d2d2d',
              border: '2px solid #9333ea',
              borderRadius: 12,
              flex: 1,
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 0.85rem 0.85rem',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Grid Lines Overlay - Only show when image is uploaded */}
            {(previewUrl || isCameraActive) && (
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                {/* Vertical lines */}
                <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#9333ea" strokeWidth="1" opacity="0.2" />
                <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#9333ea" strokeWidth="1" opacity="0.2" />
                <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#9333ea" strokeWidth="1" opacity="0.2" />
                <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#9333ea" strokeWidth="1" opacity="0.2" />
                
                {/* Horizontal lines */}
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#9333ea" strokeWidth="1" opacity="0.2" />
                <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#9333ea" strokeWidth="1" opacity="0.2" />
                <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#9333ea" strokeWidth="1" opacity="0.2" />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#9333ea" strokeWidth="1" opacity="0.2" />
                
                {/* Center oval */}
                <ellipse 
                  cx="50%" 
                  cy="50%" 
                  rx="25%" 
                  ry="35%" 
                  stroke="#9333ea" 
                  strokeWidth="2" 
                  fill="none" 
                  opacity="0.2"
                />
              </svg>
            )}

            {isCameraActive && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    display: 'block',
                  }}
                />
                <button
                  onClick={stopCamera}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    zIndex: 20,
                  }}
                >
                  <X size={22} />
                </button>
                <button
                  onClick={capturePhoto}
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'white',
                    border: '4px solid #9333ea',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                    zIndex: 20,
                  }}
                />
              </>
            )}

            {!isCameraActive && previewUrl && (
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setFileName('');
                    setCapturedBlob(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    zIndex: 20,
                  }}
                >
                  <X size={22} />
                </button>
              </>
            )}

            {!isCameraActive && !previewUrl && (
              <div 
                onClick={handleUploadClick}
                style={{ 
                  textAlign: 'center', 
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  zIndex: 15,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <Upload size={40} color="white" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    margin: 0, 
                    fontWeight: '600', 
                    color: '#ffffff', 
                    marginBottom: '0.5rem',
                  }}>
                    Upload Your Photo
                  </p>
                  <p style={{ fontSize: '0.85rem', margin: 0, color: '#9ca3af' }}>
                    Click here or paste (Ctrl+V) an image
                  </p>
                  <p style={{ fontSize: '0.75rem', margin: 0, color: '#6b7280', marginTop: '0.25rem' }}>
                    JPG, PNG or JPEG
                  </p>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Bottom Content */}
          <div style={{ flex: 0 }}>
            {/* Text */}
            <div
              style={{
                textAlign: 'center',
                marginBottom: '0.45rem',
                padding: '0 0.85rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem',
                }}
              >
                {slides[currentSlide].title}
              </h2>
              <p
                style={{
                  color: '#9ca3af',
                  fontSize: '0.82rem',
                  lineHeight: '1.25',
                  margin: 0,
                }}
              >
                {slides[currentSlide].subtitle}
              </p>
              {fileName && (
                <p
                  style={{
                    color: '#9333ea',
                    fontSize: '0.78rem',
                    marginTop: '0.35rem',
                    marginBottom: 0,
                  }}
                >
                  Selected: {fileName}
                </p>
              )}
            </div>

            {/* Dots */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.45rem',
                marginBottom: '0.45rem',
              }}
            >
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    height: '0.34rem',
                    width: currentSlide === index ? '1.35rem' : '0.34rem',
                    borderRadius: '9999px',
                    background: currentSlide === index ? '#9333ea' : '#4b5563',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                />
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'grid',
                gap: '0.5rem',
                padding: '0 0.85rem 0.7rem',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                }}
              >
                <button
                  onClick={startCamera}
                  disabled={isCameraActive}
                  style={{
                    background: isCameraActive ? '#4b5563' : '#9333ea',
                    color: 'white',
                    padding: `${BTN_PAD_Y} 0.9rem`,
                    borderRadius: 8,
                    fontSize: BTN_FONT,
                    fontWeight: 600,
                    border: 'none',
                    cursor: isCameraActive ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Camera size={18} />
                  Camera
                </button>
                <button
                  onClick={handleUploadClick}
                  style={{
                    background: '#9333ea',
                    color: 'white',
                    padding: `${BTN_PAD_Y} 0.9rem`,
                    borderRadius: 8,
                    fontSize: BTN_FONT,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Upload size={18} />
                  Upload
                </button>
              </div>
              <button
                onClick={handleStartAnalysis}
                disabled={!previewUrl}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '0.78rem 1rem',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  color: previewUrl ? '#ffffff' : '#6b7280',
                  border: previewUrl ? 'none' : '1px solid #4b5563',
                  background: previewUrl ? '#9333ea' : '#1a1a1a',
                  cursor: previewUrl ? 'pointer' : 'not-allowed',
                  opacity: previewUrl ? 1 : 0.55,
                }}
              >
                Start Analysis
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
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