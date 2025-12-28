// src/services/cloudinaryService.js
import { API_ENDPOINTS, apiCall } from '../config/api.js';

/**
 * Upload image to Cloudinary via backend
 * @param {Blob|File} imageBlob - Image file or blob
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
export async function uploadImageToCloudinary(imageBlob) {
  try {
    console.log('📤 Uploading image to Cloudinary...');
    
    // Convert blob to base64
    const base64 = await blobToBase64(imageBlob);
    console.log('📦 Image converted to base64, size:', Math.round(base64.length / 1024), 'KB');

    // Use the centralized API endpoint
    const response = await apiCall(API_ENDPOINTS.UPLOAD_IMAGE, {
      method: 'POST',
      body: JSON.stringify({ image: base64 }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    console.log('✅ Image uploaded successfully to Cloudinary');
    console.log('📷 Cloudinary URL:', data.url);
    
    return {
      url: data.url,
      publicId: data.publicId,
      width: data.width || 1000,
      height: data.height || 1000,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
}

/**
 * Delete image from Cloudinary via backend
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteImageFromCloudinary(publicId) {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    console.log('🗑️ Deleting image from Cloudinary:', publicId);

    const response = await apiCall(API_ENDPOINTS.DELETE_IMAGE(publicId), {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Delete failed' }));
      throw new Error(error.error || 'Failed to delete image');
    }

    const data = await response.json();
    console.log('✅ Image deleted successfully from Cloudinary');
    
    return {
      success: data.success || true,
      result: data.result,
    };
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw new Error(error.message || 'Failed to delete image from Cloudinary');
  }
}

/**
 * Convert Blob to base64 string
 * @param {Blob|File} blob - Image blob or file
 * @returns {Promise<string>} Base64 string (with data URI prefix)
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    if (!blob) {
      reject(new Error('No blob provided'));
      return;
    }

    const reader = new FileReader();
    
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read blob'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('FileReader error'));
    };
    
    reader.readAsDataURL(blob);
  });
}

/**
 * Optimize Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 800,
    height = 600,
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformation = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;

  // Insert transformation into Cloudinary URL
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  return url.slice(0, uploadIndex + 8) + transformation + '/' + url.slice(uploadIndex + 8);
}

/**
 * Get thumbnail URL from Cloudinary URL
 * @param {string} url - Original Cloudinary URL
 * @returns {string} Thumbnail URL
 */
export function getCloudinaryThumbnail(url) {
  return optimizeCloudinaryUrl(url, {
    width: 400,
    height: 300,
    crop: 'fill',
  });
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null
 */
export function extractPublicIdFromUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    // Extract public ID from URL like:
    // https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    const afterUpload = parts[1];
    // Remove version (v1234567890/) if present
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  optimizeCloudinaryUrl,
  getCloudinaryThumbnail,
  extractPublicIdFromUrl,
};