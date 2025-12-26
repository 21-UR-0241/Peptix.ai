/**
 * Upload image to Cloudinary via backend
 * @param {Blob|File} imageBlob - Image file or blob
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadImageToCloudinary(imageBlob) {
  try {
    // Convert blob to base64
    const base64 = await blobToBase64(imageBlob);

    // Use absolute URL as fallback if proxy doesn't work
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiUrl}/api/upload-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ image: base64 }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return {
      url: data.url,
      publicId: data.publicId,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Convert Blob to base64 string
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}