import React, { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';

function ImageUpload({ onUpload, onClose }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setFile(null);
  };

  return (
    <div className="upload-container fade-in">
      {!preview ? (
        <div className="file-input-wrapper">
          <label htmlFor="file-input" className="file-input-label">
            <Upload size={48} color="var(--primary)" />
            <h3>Choose an Image</h3>
            <p>Click to browse or drag and drop</p>
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <img 
              src={preview} 
              alt="Preview" 
              className="preview-image"
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                objectFit: 'contain',
                margin: '0 auto'
              }}
            />
          </div>
          <div className="camera-controls">
            <button className="btn btn-success" onClick={handleUpload}>
              <Check size={20} />
              Analyze This Image
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              <X size={20} />
              Choose Different Image
            </button>
          </div>
        </div>
      )}
      
      {!preview && (
        <div className="camera-controls" style={{ marginTop: '1rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            <X size={20} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;