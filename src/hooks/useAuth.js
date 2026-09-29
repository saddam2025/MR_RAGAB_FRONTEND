import { useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

/**
 * Lightweight helper to access auth context with stable helpers.
 * Usage:
 *   const { user, token, loading, login, logout, refreshUser } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);

  // Defensive fallback if provider is missing
  const safe = useMemo(() => {
    if (!ctx) {
      return {
        user: null,
        token: null,
        loading: false,
        login: async () => ({ ok: false, error: 'No AuthProvider' }),
        logout: () => {},
        refreshUser: async () => null,
      };
    }
    return ctx;
  }, [ctx]);

  return safe;
}

export default useAuth;
