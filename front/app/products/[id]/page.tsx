'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getProduct, Product } from '@/lib/api';
import { addToCart } from '@/lib/cart';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      setLoading(true);
      setError(null);
      try {
        const detail = await getProduct(Number(params.id));
        setProduct(detail);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-600 shadow-sm">Cargando producto...</div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-rose-50 p-10 text-center text-rose-700 shadow-sm">{error || 'Producto no encontrado'}</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-8 h-[420px] overflow-hidden rounded-3xl bg-slate-100">
              {product.imageUrl ? (
                <img className="h-full w-full object-cover" src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Sin imagen</div>
              )}
            </div>
            <h1 className="text-4xl font-semibold text-slate-900">{product.name}</h1>
            <p className="mt-4 text-slate-600">{product.description}</p>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-500">Categoría</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{product.category.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Precio</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">${Number(product.price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Stock disponible</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{product.stock}</p>
              </div>
              <button
                onClick={() =>
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    quantity: 1,
                    stock: product.stock,
                    imageUrl: product.imageUrl,
                    categoryName: product.category.name,
                  })
                }
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
