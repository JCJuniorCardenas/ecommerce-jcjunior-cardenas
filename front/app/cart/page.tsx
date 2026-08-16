'use client';

import { useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import { CartItem, clearCart, getCart, removeFromCart, updateCartQuantity } from '@/lib/cart';
import { createOrder } from '@/lib/order';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { requireAuth } = useRequireAuth();

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
    console.log('[checkout] click recibido', {
      cartItems: cart.length,
      cartUnits: cart.reduce((total, item) => total + item.quantity, 0),
    });

    let authenticated = false;
    try {
      authenticated = requireAuth('auth-required');
    } catch (err) {
      console.error('[checkout] error inesperado en el guard de autenticación', err);
      setError('No se pudo verificar la sesión. Recarga la página e inténtalo nuevamente.');
      return;
    }
    console.log('[checkout] resultado del guard de autenticación', { authenticated });

    if (!authenticated) {
      console.error('[checkout] checkout detenido: no hay sesión autenticada');
      setError('Debes iniciar sesión para finalizar la compra.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      console.log('[checkout] antes de createOrder', { orderItems });
      const order = await createOrder(orderItems);
      console.log('[checkout] createOrder respondió correctamente', { order });
      clearCart();
      setCart([]);
      setSuccess('Pedido creado correctamente.');
      setTimeout(() => router.push('/orders'), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el pedido';
      console.error('[checkout] createOrder falló', err);
      setError(message);
    } finally {
      console.log('[checkout] finalizando flujo');
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border-2 border-line bg-paper-soft p-6 shadow-editorial lg:p-10">
          <h1 className="font-display text-6xl text-ink">Carrito</h1>
          <p className="mt-2 max-w-2xl text-muted">Revisa tus zapatillas antes de hacer el pedido.</p>

        {cart.length === 0 ? (
          <div className="mt-8 border border-line bg-panel p-10 text-center text-muted">
            Tu carrito está vacío.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.productId} className="border border-line bg-panel p-6 shadow-editorial">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-28 w-28 overflow-hidden border border-line bg-paper">
                      {item.imageUrl ? (
                        <img className="h-full w-full object-cover" src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted">Sin imagen</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-2xl text-ink">{item.name}</h2>
                      <p className="text-sm uppercase tracking-[0.22em] text-muted">Categoría: {item.categoryName || 'N/A'}</p>
                      <p className="mt-2 text-muted">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="grid gap-3 sm:w-44">
                      <label className="block">
                        <span className="text-xs uppercase tracking-[0.3em] text-muted">Cantidad</span>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(event) => handleQuantityChange(item.productId, event.target.value)}
                          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-ink outline-none"
                        />
                      </label>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="border border-[#7a1e26] bg-[#2a1014] px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#ff8b95] transition hover:brightness-110"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit border-2 border-line bg-panel p-6 shadow-editorial">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Total parcial</p>
                  <p className="font-display text-5xl text-terracotta">${subtotal.toFixed(2)}</p>
                </div>
                {error ? <div className="border border-[#7a1e26] bg-[#2a1014] p-4 text-sm text-[#ff8b95]">{error}</div> : null}
                {success ? <div className="border border-[#0f6a3f] bg-[#10281b] p-4 text-sm text-[#8df2bc]">{success}</div> : null}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full border border-[#0b0d0f] bg-terracotta px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#0b0d0f] transition hover:brightness-95 disabled:opacity-60"
                >
                  {loading ? 'Procesando pedido...' : 'Finalizar compra'}
                </button>
              </div>
            </aside>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
