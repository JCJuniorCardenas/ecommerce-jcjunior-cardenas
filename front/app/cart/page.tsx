'use client';

import { useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import { CartItem, clearCart, getCart, removeFromCart, updateCartQuantity } from '@/lib/cart';
import { createOrder } from '@/lib/order';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  function handleQuantityChange(productId: number, value: string) {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setCart(updateCartQuantity(productId, quantity));
  }

  function handleRemove(productId: number) {
    setCart(removeFromCart(productId));
  }

  async function handleCheckout() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await createOrder(
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      );
      clearCart();
      setCart([]);
      setSuccess('Pedido creado correctamente.');
      setTimeout(() => router.push('/orders'), 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-slate-900">Carrito</h1>
        <p className="mt-2 text-slate-600">Revisa tus productos antes de hacer el pedido.</p>

        {cart.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-slate-50 p-10 text-center text-slate-600 shadow-sm">
            Tu carrito está vacío.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.productId} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-28 w-28 overflow-hidden rounded-3xl bg-slate-100">
                      {item.imageUrl ? (
                        <img className="h-full w-full object-cover" src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">Sin imagen</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900">{item.name}</h2>
                      <p className="text-sm text-slate-600">Categoría: {item.categoryName || 'N/A'}</p>
                      <p className="mt-2 text-slate-700">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="grid gap-3 sm:w-44">
                      <label className="block">
                        <span className="text-sm text-slate-500">Cantidad</span>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(event) => handleQuantityChange(item.productId, event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none"
                        />
                      </label>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Total parcial</p>
                  <p className="text-3xl font-semibold text-slate-900">${subtotal.toFixed(2)}</p>
                </div>
                {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
                {success ? <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div> : null}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {loading ? 'Procesando pedido...' : 'Finalizar compra'}
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
