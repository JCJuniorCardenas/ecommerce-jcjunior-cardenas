import { fetchWithAuth } from './api';

export type OrderItemPayload = {
  productId: number;
  quantity: number;
};

export async function createOrder(items: OrderItemPayload[]) {
  console.log('[createOrder] iniciando petición', { items });

  const res = await fetchWithAuth('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  console.log('[createOrder] respuesta HTTP recibida', {
    status: res.status,
    ok: res.ok,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message || 'No se pudo crear el pedido';
    console.error('[createOrder] backend devolvió un error', { status: res.status, body });
    throw new Error(message);
  }

  const order = await res.json();
  console.log('[createOrder] pedido creado', { order });
  return order;
}

export async function getMyOrders() {
  const res = await fetchWithAuth('/orders/me');

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || 'No se pudo cargar tus pedidos');
  }

  return res.json();
}

export async function confirmPayment(orderId: number) {
  const res = await fetchWithAuth(`/orders/${orderId}/confirm-payment`, {
    method: 'POST',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message || 'No se pudo confirmar el pago');
  }

  return res.json();
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export type Order = {
  id: number;
  total: string | number;
  status: OrderStatus;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: string | number;
    product: { name: string };
  }>;
  user?: { id: number; email: string; role: string };
};

export async function getAllOrders(): Promise<Order[]> {
  const res = await fetchWithAuth('/orders');
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || 'No se pudieron cargar los pedidos');
  }
  return res.json();
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const res = await fetchWithAuth(`/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message || 'No se pudo actualizar el estado');
  }
  return res.json();
}
