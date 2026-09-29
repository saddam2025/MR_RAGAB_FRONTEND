// src/services/authService.js
import api from './api';

/**
 * Lightweight auth service wrapper.
 * Methods return the same shape as api.* (i.e. { data, status, headers })
 * so callers that expect res.data will continue to work.
 */

const authService = {
  login: async (credentials) => {
    // credentials: { email, password } or similar
    return api.post('/auth/login', credentials);
  },

  register: async (payload) => {
    // payload: { name, email, password, ... }
    return api.post('/auth/register', payload);
  },

  me: async () => {
    return api.get('/auth/me');
  },

  setupMfa: async () => api.post('/auth/mfa/setup'),

  confirmMfa: async (code) => api.post('/auth/mfa/confirm', { code }),

  verifyMfaLogin: async ({ pendingLoginToken, code, backupCode }) =>
    api.post('/auth/mfa/verify-login', { pendingLoginToken, ...(code ? { code } : {}), ...(backupCode ? { backupCode } : {}) }),

  disableMfa: async ({ password, code }) => api.post('/auth/mfa/disable', { password, code }),

  acceptInvite: async (token, password) => api.post(`/auth/accept-invite/${encodeURIComponent(token)}`, { password }),

  uploadAvatar: async (file) => {
    const formData = new FormData();
    // This field name is part of the backend contract (uploadAvatar middleware).
    formData.append('avatar', file);
    return api.patch('/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  logout: async () => {
    // optional server-side logout endpoint
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore server logout errors; client will clear token anyway
    }
    api.setAuthToken(null);
    return { ok: true };
  },
};

export default authService;
