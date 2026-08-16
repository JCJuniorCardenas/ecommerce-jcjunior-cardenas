'use client';

import { useEffect, useState } from 'react';
import { LoginRedirectReason, getSessionToken, redirectToLogin } from './session';

type UseRequireAuthOptions = {
  autoRedirect?: boolean;
  reason?: LoginRedirectReason;
};

export function useRequireAuth(options?: UseRequireAuthOptions) {
  const { autoRedirect = false, reason = 'auth-required' } = options ?? {};
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getSessionToken();
    const hasToken = Boolean(token);
    setIsAuthenticated(hasToken);
    setIsCheckingAuth(false);

    if (!hasToken && autoRedirect) {
      redirectToLogin(reason);
    }
  }, [autoRedirect, reason]);

  function requireAuth(redirectReason: LoginRedirectReason = 'auth-required') {
    const token = getSessionToken();
    console.log('[useRequireAuth] verificando token para acción protegida', {
      hasToken: Boolean(token),
      redirectReason,
    });

    if (!token) {
      console.error('[useRequireAuth] token ausente; se solicitará login', { redirectReason });
      redirectToLogin(redirectReason);
      return false;
    }
    return true;
  }

  return { isCheckingAuth, isAuthenticated, requireAuth };
}