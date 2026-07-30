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
  if (!res.ok) throw new Error('No se pudo cargar el producto');
  return res.json();
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
