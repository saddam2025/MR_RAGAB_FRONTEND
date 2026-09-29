// src/contexts/AuthProvider.jsx
import React, { createContext, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { setAuthToken as setApiAuthToken } from '../services/api';
import { dashboardPathFor } from '../utils/dashboardPath';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  acceptInvite: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  updateUser: () => {},
});

function readStoredToken() {
  try {
    return localStorage.getItem('math-auth-token') || localStorage.getItem('mp_token') || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('mp_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token) && !user);

  const saveSession = useCallback((tkn, userObj) => {
    if (tkn) {
      setApiAuthToken(tkn);
    } else {
      setApiAuthToken(null);
    }

    if (userObj) {
      try {
        localStorage.setItem('mp_user', JSON.stringify(userObj));
      } catch {}
    } else {
      try {
        localStorage.removeItem('mp_user');
      } catch {}
    }

    setToken(tkn || null);
    setUser(userObj || null);
  }, []);

  // NOTE: this intentionally does NOT touch the global `loading` state.
  // `loading` gates RouteGuard's entire routed subtree (it renders a plain
  // "جارٍ التحميل..." placeholder in its place while true) — that flag must
  // only ever reflect initial session hydration (see refreshUser below).
  // It previously also flipped true/false around this request, which made
  // RouteGuard unmount the whole LoginPage while the request was in flight
  // and remount a brand-new instance once it settled — wiping out
  // LoginForm's local `serverError` state before it could ever be shown,
  // so a failed login silently looked like nothing happened. Per-submit
  // loading/disabled-button state is now LoginForm's own local concern.
  const login = useCallback(
    async (credentials) => {
      try {
        const res = await authService.login(credentials);
        const payload = res?.data || {};
        if (payload.mfaRequired && payload.pendingLoginToken) {
          return {
            ok: false,
            mfaRequired: true,
            pendingLoginToken: payload.pendingLoginToken,
            expiresIn: payload.expiresIn,
          };
        }
        const tkn = payload.token || payload.accessToken || payload.data?.token;
        const userObj = payload.user || payload.data?.user || payload;
        if (!tkn && !userObj) {
          return { ok: false, error: 'قد يكون هناك خطأ في البريد الإلكتروني أو كلمة المرور، أعد المحاولة' };
        }

        saveSession(tkn, userObj);
        navigate(dashboardPathFor(userObj), { replace: true });
        return { ok: true, data: userObj };
      } catch {
        return { ok: false, error: 'قد يكون هناك خطأ في البريد الإلكتروني أو كلمة المرور، أعد المحاولة' };
      }
    },
    [navigate, saveSession]
  );

  // Registration already returns a signed session token.  Reusing it avoids
  // a second request whose independent failure could falsely make a completed
  // registration look unsuccessful.
  const register = useCallback(async (registrationPayload) => {
    try {
      const res = await authService.register(registrationPayload);
      const payload = res?.data || {};
      const tkn = payload.token || payload.accessToken || payload.data?.token;
      const userObj = payload.user || payload.data?.user;
      if (!tkn || !userObj) {
        return { ok: false, error: 'تم إنشاء الحساب، لكن استجابة تسجيل الدخول غير مكتملة.' };
      }

      saveSession(tkn, userObj);
      navigate(dashboardPathFor(userObj), { replace: true });
      return { ok: true, data: userObj };
    } catch (err) {
      return { ok: false, error: err?.message || 'تعذر إنشاء الحساب. يرجى المحاولة لاحقًا.' };
    }
  }, [navigate, saveSession]);

  const verifyMfaLogin = useCallback(async ({ pendingLoginToken, code, backupCode }) => {
    try {
      const res = await authService.verifyMfaLogin({ pendingLoginToken, code, backupCode });
      const payload = res?.data || {};
      const tkn = payload.token || payload.data?.token;
      const userObj = payload.user || payload.data?.user;
      if (!tkn || !userObj) return { ok: false, error: 'استجابة غير مكتملة من الخادم' };
      saveSession(tkn, userObj);
      navigate(dashboardPathFor(userObj), { replace: true });
      return { ok: true, data: userObj };
    } catch (err) {
      return { ok: false, error: err?.message || 'رمز التحقق غير صحيح أو انتهت صلاحيته' };
    }
  }, [navigate, saveSession]);

  const acceptInvite = useCallback(async (inviteToken, password) => {
    try {
      const res = await authService.acceptInvite(inviteToken, password);
      const payload = res?.data || {};
      const tkn = payload.token || payload.data?.token;
      const userObj = payload.user || payload.data?.user;
      if (!tkn || !userObj) return { ok: false, error: 'استجابة غير مكتملة من الخادم' };
      saveSession(tkn, userObj);
      navigate(dashboardPathFor(userObj), { replace: true });
      return { ok: true, data: userObj };
    } catch (err) {
      return { ok: false, error: err?.message || 'تعذر قبول الدعوة' };
    }
  }, [navigate, saveSession]);

  const logout = useCallback(() => {
    try {
      authService.logout().catch(() => {});
    } catch {}
    saveSession(null, null);
    navigate('/login', { replace: true });
  }, [navigate, saveSession]);

  // Applies a local update from authenticated profile actions (such as avatar
  // upload) so every consumer of useAuth rerenders without a page reload.
  const updateUser = useCallback((updates) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const nextUser = { ...currentUser, ...updates };
      try {
        localStorage.setItem('mp_user', JSON.stringify(nextUser));
      } catch {}
      return nextUser;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = readStoredToken();
    if (!stored) {
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      setApiAuthToken(stored);
      const res = await authService.me();
      // api.get() preserves the backend envelope.  /auth/me responds with
      // { data: user }, so storing res.data directly made the authenticated
      // user look like { data: { ...user } }.  Consumers such as the wallet
      // correctly read user.walletBalance and therefore fell back to 0.
      const payload = res?.data?.data || res?.data || null;
      setUser(payload);
      try {
        localStorage.setItem('mp_user', JSON.stringify(payload));
      } catch {}
      setToken(stored);
      setLoading(false);
      return payload;
    } catch (err) {
      saveSession(null, null);
      setLoading(false);
      return null;
    }
  }, [saveSession]);

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    } else {
      setLoading(false);
      if (token) setApiAuthToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (token) setApiAuthToken(token);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyMfaLogin,
        acceptInvite,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
