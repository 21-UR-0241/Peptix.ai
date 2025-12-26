import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check } from 'lucide-react';

function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setCapturedImage(url);
      }, 'image/jpeg');
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const confirmCapture = () => {
    canvasRef.current.toBlob((blob) => {
      onCapture(blob);
      stopCamera();
    }, 'image/jpeg');
  };

  return (
    <div className="camera-container fade-in">
      <div className="video-container">
        {!capturedImage ? (
          <video ref={videoRef} autoPlay playsInline />
        ) : (
          <img src={capturedImage} alt="Captured" />
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="camera-controls">
        {!capturedImage ? (
          <>
            <button className="btn btn-primary" onClick={captureImage}>
              <Camera size={20} />
              Capture
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              <X size={20} />
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-success" onClick={confirmCapture}>
              <Check size={20} />
              Use This Photo
            </button>
            <button className="btn btn-secondary" onClick={retake}>
              <Camera size={20} />
              Retake
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CameraCapture;