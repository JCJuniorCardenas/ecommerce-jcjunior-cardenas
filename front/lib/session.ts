const TOKEN_KEY = 'ecommerce_token';
const USER_EMAIL_KEY = 'ecommerce_user_email';
const USER_ROLE_KEY = 'ecommerce_user_role';
export const SESSION_UPDATED_EVENT = 'ecommerce:session-updated';

export type LoginRedirectReason = 'auth-required' | 'session-expired';

export function getSessionToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSessionEmail() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_EMAIL_KEY);
}

export function getSessionRole() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ROLE_KEY);
}

export function saveSession(token: string, email: string, role: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_EMAIL_KEY, email);
  localStorage.setItem(USER_ROLE_KEY, role);
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export function redirectToLogin(reason: LoginRedirectReason) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams({ reason });
  const destination = `/login?${params.toString()}`;
  console.log('[session] redirigiendo a login', { reason, destination });
  window.location.assign(destination);
}