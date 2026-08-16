'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { confirmPayment, getMyOrders } from '@/lib/order';
import { useRequireAuth } from '@/lib/useRequireAuth';

const statusStyles: Record<string, string> = {
  PENDING: 'border-zinc-500 bg-zinc-900 text-zinc-200',
  PROCESSING: 'border-terracotta bg-[#24230d] text-terracotta',
  SHIPPED: 'border-indigo-400 bg-indigo-950 text-indigo-200',
  DELIVERED: 'border-emerald-400 bg-emerald-950 text-emerald-200',
  CANCELED: 'border-red-400 bg-red-950 text-red-200',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState<{ orderId: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isCheckingAuth, isAuthenticated } = useRequireAuth({
    autoRedirect: true,
    reason: 'auth-required',
  });

  useEffect(() => {
    if (isCheckingAuth || !isAuthenticated) {
      return;
    }

    async function loadOrders() {
      setLoading(true);
      setError(null);

      try {
        const response = await getMyOrders();
        setOrders(response);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isCheckingAuth, isAuthenticated]);

  async function handleConfirmPayment(orderId: number) {
    setConfirmingOrderId(orderId);
    setPaymentError(null);

    try {
      const updatedOrder = await confirmPayment(orderId);
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order,
        ),
      );
    } catch (err) {
      setPaymentError({ orderId, message: (err as Error).message });
    } finally {
      setConfirmingOrderId(null);
    }
  }

  if (isCheckingAuth) {
    return (
      <div>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="border border-line bg-panel p-10 text-center text-muted">
            Verificando sesión...
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border-2 border-line bg-paper-soft p-6 shadow-editorial lg:p-10">
          <h1 className="font-display text-6xl text-ink">Mis pedidos</h1>
          <p className="mt-2 max-w-2xl text-muted">Consulta el historial de tus compras y el estado de cada pedido.</p>

          {loading ? (
            <div className="mt-8 border border-line bg-panel p-10 text-center text-muted">Cargando pedidos...</div>
          ) : error ? (
            <div className="mt-8 border border-[#7a1e26] bg-[#2a1014] p-8 text-[#ff8b95]">{error}</div>
          ) : orders.length === 0 ? (
            <div className="mt-8 border border-line bg-panel p-10 text-center text-muted">Aún no tienes pedidos.</div>
          ) : (
            <div className="mt-8 space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-line bg-panel p-6 shadow-editorial">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted">Pedido #{order.id}</p>
                      <p className="font-display text-4xl text-terracotta">Total: ${Number(order.total).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className={`border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusStyles[order.status] ?? 'border-line bg-paper text-muted'}`}>
                        {order.status}
                      </span>
                      {order.status === 'PENDING' ? (
                        <div className="flex flex-col items-end gap-2">
                          <p className="max-w-xs text-right text-xs uppercase tracking-[0.12em] text-[#e8dd66]">
                            Confirmá tu pago antes de que expire tu pedido.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleConfirmPayment(order.id)}
                            disabled={confirmingOrderId === order.id}
                            className="border border-[#0b0d0f] bg-terracotta px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0b0d0f] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {confirmingOrderId === order.id ? 'Confirmando...' : 'Confirmar pago'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {paymentError && paymentError.orderId === order.id ? (
                    <div className="mt-4 border border-[#7a1e26] bg-[#2a1014] p-4 text-sm text-[#ff8b95]">{paymentError.message}</div>
                  ) : null}

                  <div className="mt-6 grid gap-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="border border-line bg-paper p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-display text-2xl text-ink">{item.product.name}</p>
                            <p className="text-xs uppercase tracking-[0.3em] text-muted">Cantidad: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-ink">${Number(item.unitPrice).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
