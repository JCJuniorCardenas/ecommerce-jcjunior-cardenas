'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getAllOrders, Order, OrderStatus, updateOrderStatus } from '@/lib/order';
import { getSessionRole, redirectToLogin } from '@/lib/session';
import { useRequireAuth } from '@/lib/useRequireAuth';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELED'],
  PROCESSING: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELED: [],
};

const statusStyles: Record<OrderStatus, string> = {
  PENDING: 'border-zinc-500 bg-zinc-900 text-zinc-200',
  PROCESSING: 'border-terracotta bg-[#24230d] text-terracotta',
  SHIPPED: 'border-indigo-400 bg-indigo-950 text-indigo-200',
  DELIVERED: 'border-emerald-400 bg-emerald-950 text-emerald-200',
  CANCELED: 'border-red-400 bg-red-950 text-red-200',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { isCheckingAuth, isAuthenticated } = useRequireAuth({ autoRedirect: true });

  useEffect(() => {
    if (isCheckingAuth || !isAuthenticated) return;
    if (getSessionRole() !== 'ADMIN') {
      redirectToLogin('auth-required');
      return;
    }

    getAllOrders()
      .then(setOrders)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [isCheckingAuth, isAuthenticated]);

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    setUpdatingId(orderId);
    setError(null);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (isCheckingAuth || !isAuthenticated) {
    return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10"><div className="border border-line bg-panel p-10 text-center text-muted">Verificando acceso...</div></main></>;
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border-2 border-line bg-paper-soft p-6 shadow-editorial lg:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Control room</p>
          <h1 className="mt-2 font-display text-6xl text-ink">Pedidos</h1>
          <p className="mt-2 text-muted">Gestiona el ciclo de vida de cada compra sin saltar estados.</p>

          {error ? <div className="mt-6 border border-[#7a1e26] bg-[#2a1014] p-4 text-[#ff8b95]">{error}</div> : null}
          {loading ? <div className="mt-8 border border-line bg-panel p-10 text-center text-muted">Cargando pedidos...</div> : null}

          {!loading && !orders.length ? <div className="mt-8 border border-line bg-panel p-10 text-center text-muted">No hay pedidos registrados.</div> : null}

          <div className="mt-8 space-y-5">
            {orders.map((order) => {
              const nextStates = transitions[order.status];
              return (
                <article key={order.id} className="border border-line bg-panel p-5 shadow-editorial">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">Pedido #{order.id}</p>
                      <p className="mt-1 text-sm text-muted">{order.user?.email} · {new Date(order.createdAt).toLocaleString('es-ES')}</p>
                      <p className="mt-2 font-display text-3xl text-terracotta">${Number(order.total).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                      {nextStates.length ? (
                        <select
                          value=""
                          disabled={updatingId === order.id}
                          onChange={(event) => handleStatusChange(order.id, event.target.value as OrderStatus)}
                          className="border border-line bg-paper px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink"
                        >
                          <option value="">Cambiar estado</option>
                          {nextStates.map((nextStatus) => <option key={nextStatus} value={nextStatus}>{nextStatus}</option>)}
                        </select>
                      ) : <span className="text-xs uppercase tracking-[0.18em] text-muted">Estado final</span>}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 border-t border-line pt-4 text-sm text-muted sm:grid-cols-2">
                    {order.items.map((item) => <p key={item.id}>{item.quantity} × {item.product.name} — ${Number(item.unitPrice).toFixed(2)}</p>)}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
