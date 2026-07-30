'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getMyOrders } from '@/lib/order';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-slate-900">Mis pedidos</h1>
        <p className="mt-2 text-slate-600">Consulta el historial de tus compras y el estado de cada pedido.</p>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-slate-50 p-10 text-center text-slate-600 shadow-sm">Cargando pedidos...</div>
        ) : error ? (
          <div className="mt-8 rounded-3xl bg-rose-50 p-8 text-rose-700 shadow-sm">{error}</div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-slate-50 p-10 text-center text-slate-600 shadow-sm">Aún no tienes pedidos.</div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Pedido #{order.id}</p>
                    <p className="text-lg font-semibold text-slate-900">Total: ${Number(order.total).toFixed(2)}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                    {order.status}
                  </span>
                </div>

                <div className="mt-6 grid gap-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{item.product.name}</p>
                          <p className="text-sm text-slate-500">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">${Number(item.unitPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
