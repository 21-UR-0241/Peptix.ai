// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://peptix-ai.onrender.com';

console.log('🔗 API Base URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  AUTH_ME: `${API_BASE_URL}/api/auth/me`,
  AUTH_UPDATE_PROFILE: `${API_BASE_URL}/api/auth/update-profile`,
  AUTH_UPDATE_PROFILE_PICTURE: `${API_BASE_URL}/api/auth/profile/picture`,
  AUTH_REMOVE_PROFILE_PICTURE: `${API_BASE_URL}/api/auth/profile/picture`,
  AUTH_CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  AUTH_GOOGLE: `${API_BASE_URL}/api/auth/google`,
  CLAUDE: `${API_BASE_URL}/api/claude`,
  HISTORY: `${API_BASE_URL}/api/history`,
  HISTORY_DELETE: (id) => `${API_BASE_URL}/api/history/${id}`,
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  DELETE_IMAGE: (publicId) => `${API_BASE_URL}/api/delete-image/${publicId}`,
};

export async function apiCall(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
}

export default API_BASE_URL;