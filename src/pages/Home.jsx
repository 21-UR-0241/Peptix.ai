
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Sparkles,
  CheckCircle,
  MessageCircle,
  Upload,
  X,
} from 'lucide-react';
import AnimatedLogo from '../components/AnimatedLogo';
import analyzeImageWithAI from '../services/aiService';
import { uploadImageToCloudinary } from '../services/cloudinaryService';

export default function PeptixHome() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('scan');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);

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
    // Upload to Cloudinary first
    console.log('📤 Uploading image to Cloudinary...');
    const cloudinaryResult = await uploadImageToCloudinary(capturedBlob);
    console.log('✅ Image uploaded:', cloudinaryResult.url);

    // Store the Cloudinary URL
    sessionStorage.setItem('uploadedImage', cloudinaryResult.url);
    sessionStorage.setItem('imagePublicId', cloudinaryResult.publicId);

    // Analyze with AI
    const result = await analyzeImageWithAI(capturedBlob);

    if (!result || !result.peptides || result.peptides.length === 0) {
      throw new Error('No valid recommendations received from AI');
    }

    // Add Cloudinary URL to result
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
        <p style={{ marginTop: '1.25rem', fontSize: '1.05rem', fontWeight: '600' }}>
          Analyzing your image...
        </p>
        <p style={{ color: '#9ca3af', marginTop: '0.35rem', fontSize: '0.9rem' }}>
          This may take 10-30 seconds
        </p>
      </div>
    );
  }

  // Compact sizing knobs (easy to tweak)
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
          minHeight: 0, // important for flex children to shrink/grow correctly
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
          {/* Preview Area (fills remaining space) */}
          <div
            style={{
              background: '#2d2d2d',
              borderRadius: 0,
              flex: 1,
              minHeight: '340px', // slightly smaller to free space for controls
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.55rem',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
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
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
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
                    border: '4px solid #a855f7',
                    borderRadius: '50%',
                    width: '60px', // smaller
                    height: '60px', // smaller
                    cursor: 'pointer',
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
                    objectFit: 'contain',
                    display: 'block',
                    background: '#111',
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
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  <X size={22} />
                </button>
              </>
            )}

            {!isCameraActive && !previewUrl && (
              <div style={{ textAlign: 'center', color: '#666' }}>
                <Camera
                  size={44}
                  style={{ margin: '0 auto 0.4rem', opacity: 0.4 }}
                  strokeWidth={1.5}
                />
                <p style={{ fontSize: '0.75rem', margin: 0 }}>Preview area</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Bottom Content (more compact) */}
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
                    color: '#a855f7',
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
                    background: currentSlide === index ? 'white' : '#4b5563',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                  }}
                />
              ))}
            </div>

            {/* CTA Buttons (reduced heights) */}
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
                    background: isCameraActive
                      ? '#4b5563'
                      : 'linear-gradient(to right, #9333ea, #a855f7, #9333ea)',
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
                    background: 'linear-gradient(to right, #9333ea, #a855f7, #9333ea)',
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
                  padding: '0.78rem 1rem', // reduced
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  color: previewUrl ? '#ffffff' : '#6b7280',
                  border: previewUrl ? 'none' : '1px solid #4b5563',
                  background: previewUrl
                    ? 'linear-gradient(to right, #9333ea, #a855f7, #9333ea)'
                    : '#1a1a1a',
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

      {/* Bottom Navigation (slightly shorter) */}
      <nav
        style={{
          borderTop: '1px solid #1f2937',
          background: 'black',
          padding: '0.35rem 0',
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
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.15rem',
                padding: '0.35rem 1.1rem',
                background: 'none',
                border: 'none',
                color: activeTab === id ? '#a855f7' : '#6b7280',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}