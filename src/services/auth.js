// src/services/auth.js
import { API_ENDPOINTS, apiCall } from '../config/api.js';

export const authService = {
  async signup(name, email, password) {
    const response = await apiCall(API_ENDPOINTS.AUTH_SIGNUP, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    return response.json();
  },

  async login(email, password) {
    const response = await apiCall(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async logout() {
    const response = await apiCall(API_ENDPOINTS.AUTH_LOGOUT, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  },

  async getCurrentUser() {
    const response = await apiCall(API_ENDPOINTS.AUTH_ME, {
      method: 'GET',
    });

    if (!response.ok) {
      return { user: null };
    }

    return response.json();
  },

  async updateProfile(name) {
    const response = await apiCall(API_ENDPOINTS.AUTH_UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Update failed');
    }

    return response.json();
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiCall(API_ENDPOINTS.AUTH_CHANGE_PASSWORD, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password change failed');
    }

    return response.json();
  },

  loginWithGoogle() {
    window.location.href = API_ENDPOINTS.AUTH_GOOGLE;
  }
};