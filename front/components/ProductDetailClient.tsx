'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import type { Product } from '@/lib/api';
import { addToCart, CART_UPDATED_EVENT, getAvailableStock } from '@/lib/cart';

type ProductDetailClientProps = {
  product: Product;
};

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [stockError, setStockError] = useState<string | null>(null);
  const [_cartVersion, setCartVersion] = useState(0);

  useEffect(() => {
    const syncCart = () => {
      setCartVersion((current) => current + 1);
    };

    syncCart();
    window.addEventListener('storage', syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  const availableStock = getAvailableStock(product.id, product.stock);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="border-2 border-line bg-paper-soft p-8 shadow-editorial">
            <div className="mb-8 h-[420px] overflow-hidden border border-line bg-paper">
              {product.imageUrl ? (
                <img className="h-full w-full object-cover" src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="flex h-full items-center justify-center text-muted">Sin imagen</div>
              )}
            </div>
            <h1 className="font-display text-6xl leading-[0.9] text-ink">{product.name}</h1>
            <p className="mt-4 text-muted">{product.description}</p>
          </div>

          <aside className="border-2 border-line bg-paper-soft p-8 shadow-editorial">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Categoría</p>
                <p className="mt-1 text-lg font-semibold text-ink">{product.category.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Precio</p>
                <p className="mt-1 font-display text-5xl text-terracotta">${Number(product.price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Stock disponible</p>
                <p className="mt-2 inline-flex border border-[#0b0d0f] bg-terracotta px-3 py-1 text-base font-bold uppercase tracking-[0.16em] text-[#0b0d0f]">
                  {availableStock} unidades
                </p>
              </div>
              <button
                onClick={() => {
                  if (availableStock <= 0) {
                    setStockError('No hay más stock disponible de este producto');
                    return;
                  }

                  addToCart({
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    quantity: 1,
                    stock: product.stock,
                    imageUrl: product.imageUrl,
                    categoryName: product.category.name,
                  });

                  if (stockError) {
                    setStockError(null);
                  }
                }}
                className="w-full border border-[#0b0d0f] bg-terracotta px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#0b0d0f] transition hover:brightness-95"
                disabled={availableStock === 0}
              >
                {availableStock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
              {stockError ? (
                <div className="border border-[#7a1e26] bg-[#2a1014] p-3 text-sm font-semibold text-[#ff8b95]">
                  {stockError}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}