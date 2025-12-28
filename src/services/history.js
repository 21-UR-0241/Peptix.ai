// src/services/history.js
import { API_ENDPOINTS, apiCall } from '../config/api.js';

export const historyService = {
  async getHistory() {
    const response = await apiCall(API_ENDPOINTS.HISTORY, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return response.json();
  },

  async saveHistory(productName, analysis, imageUrl, healthScore) {
    const response = await apiCall(API_ENDPOINTS.HISTORY, {
      method: 'POST',
      body: JSON.stringify({ productName, analysis, imageUrl, healthScore }),
    });

    if (!response.ok) {
      throw new Error('Failed to save history');
    }

    return response.json();
  },

  async deleteHistory(id) {
    const response = await apiCall(API_ENDPOINTS.HISTORY_DELETE(id), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete history');
    }

    return response.json();
  }
};