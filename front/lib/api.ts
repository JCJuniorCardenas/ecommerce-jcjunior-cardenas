import { clearSession, getSessionToken, redirectToLogin } from './session';

const API_BASE = '/api';

export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  imageUrl?: string;
  category: Category;
};

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Error cargando categorías');
  return res.json();
}

export async function getProducts(params: {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
} = {}): Promise<{ items: Product[] }> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.categoryId) searchParams.set('categoryId', String(params.categoryId));
  if (params.search) searchParams.set('search', params.search);

  const res = await fetch(`${API_BASE}/products?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Error cargando productos');
  return res.json();
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) {
    const errorMessage = await extractBackendMessage(res);
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function fetchWithAuth(path: string, init?: RequestInit) {
  const token = getSessionToken();

  if (!token) {
    console.error('[fetchWithAuth] no hay token; redirigiendo a login', { path });
    redirectToLogin('auth-required');
    throw new Error('Debes iniciar sesión para continuar');
  }

  const headers = new Headers(init?.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    console.log('[fetchWithAuth] ejecutando petición', { path, method: init?.method ?? 'GET' });
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    console.error('[fetchWithAuth] error de red o fetch', { path, error });
    throw new Error('No se pudo conectar con el servidor');
  }

  if (res.status === 401 || res.status === 403) {
    console.error('[fetchWithAuth] sesión rechazada por backend', { path, status: res.status });
    clearSession();
    redirectToLogin('session-expired');
    throw new Error('Tu sesión expiró, volvé a iniciar sesión');
  }

  return res;
}

async function extractBackendMessage(res: Response) {
  let payload: any = null;

  try {
    payload = await res.json();
  } catch (_) {
    return `Error ${res.status}: ${res.statusText}`;
  }

  if (!payload) {
    return `Error ${res.status}: ${res.statusText}`;
  }

  const message = payload.message ?? payload.error ?? payload.statusCode;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return typeof message === 'string' ? message : `Error ${res.status}: ${res.statusText}`;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorMessage = await extractBackendMessage(res);
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorMessage = await extractBackendMessage(res);
    throw new Error(errorMessage);
  }

  return res.json();
}
