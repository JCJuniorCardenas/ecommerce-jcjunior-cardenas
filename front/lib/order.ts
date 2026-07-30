const API_BASE = '/api';

export type OrderItemPayload = {
  productId: number;
  quantity: number;
};

export async function createOrder(items: OrderItemPayload[]) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ecommerce_token') : null;
  if (!token) throw new Error('Debes iniciar sesión para realizar el pedido');

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || 'No se pudo crear el pedido');
  }

  return res.json();
}

export async function getMyOrders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ecommerce_token') : null;
  if (!token) throw new Error('Debes iniciar sesión para ver tus pedidos');

  const res = await fetch(`${API_BASE}/orders/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || 'No se pudo cargar tus pedidos');
  }

  return res.json();
}
