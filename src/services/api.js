// src/services/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Keep compatibility with different localStorage keys used across the codebase
const TOKEN_KEYS = ['math-auth-token', 'mp_token'];

export function setAuthToken(token) {
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    // persist token under both keys so older code that reads either will work
    try {
      TOKEN_KEYS.forEach((k) => localStorage.setItem(k, token));
    } catch (e) {
      // ignore storage errors
    }
  } else {
    delete instance.defaults.headers.common.Authorization;
    try {
      TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      // ignore
    }
  }
}

// Upload APIs return paths such as /uploads/avatars/file.webp. Resolve only
// those backend-owned paths against the API origin when frontend and backend
// run on different development ports.
export function resolveApiAssetUrl(url) {
  if (!url || typeof url !== 'string') return url;
  // Old records may have `uploads/...`, `/uploads/...`, or Windows-style
  // separators. Always turn backend-owned upload paths into an API-origin URL.
  const normalized = url.trim().replace(/\\/g, '/').replace(/^\/?(?:src\/)?uploads\//, '/uploads/');
  if (!normalized.startsWith('/uploads/')) return url;
  try {
    return new URL(normalized, instance.defaults.baseURL).toString();
  } catch {
    return normalized;
  }
}

// initialize token from storage if present
try {
  const stored = localStorage.getItem(TOKEN_KEYS[0]) || localStorage.getItem(TOKEN_KEYS[1]);
  if (stored) setAuthToken(stored);
} catch (e) {
  // ignore
}

// normalize response errors
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const responseData = error?.response?.data;
    let normalizedData = responseData;
    if (typeof Blob !== 'undefined' && responseData instanceof Blob) {
      try {
        const text = await responseData.text();
        try { normalizedData = JSON.parse(text); } catch { normalizedData = { message: text }; }
      } catch { normalizedData = null; }
    }
    const payload = normalizedData
      ? { ...(typeof normalizedData === 'object' ? normalizedData : { message: String(normalizedData) }), status: normalizedData.status || error.response.status }
      : { message: error.message || 'Network error', status: error?.response?.status || 0 };
    return Promise.reject(payload);
  }
);

/**
 * NOTE: many places in the codebase expect the shape { data: ... } from service calls.
 * To remain compatible we return an object with a `data` property rather than raw data.
 */
const api = {
  instance,
  setAuthToken,
  get: (path, config = {}) =>
    instance
      .get(path, config)
      .then((r) => ({ data: r.data, status: r.status, headers: r.headers })),
  post: (path, body, config = {}) =>
    instance
      .post(path, body, config)
      .then((r) => ({ data: r.data, status: r.status, headers: r.headers })),
  patch: (path, body, config = {}) =>
    instance
      .patch(path, body, config)
      .then((r) => ({ data: r.data, status: r.status, headers: r.headers })),
  delete: (path, config = {}) =>
    instance
      .delete(path, config)
      .then((r) => ({ data: r.data, status: r.status, headers: r.headers })),
};

export default api;
