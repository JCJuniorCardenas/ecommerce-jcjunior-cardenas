'use client';

import { useEffect, useMemo, useState } from 'react';
import { Category, Product, getCategories, getProducts } from '@/lib/api';
import { addToCart } from '@/lib/cart';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts({ page: 1, limit: 24 }),
        ]);
        setCategories(categoriesData);
        setProducts(productsData.items);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory ? product.category.id === activeCategory : true;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Catálogo de productos</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Explora artículos, filtra por categoría y busca productos en tiempo real.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${activeCategory === null ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-900'}`}
            >
              Todas las categorías
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${activeCategory === category.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-900'}`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-sm font-medium text-slate-600">Productos encontrados:</span>
              <span className="ml-2 text-lg font-semibold text-slate-900">{filteredProducts.length}</span>
            </div>
            <label className="block w-full sm:w-auto">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white sm:w-80"
              />
            </label>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl bg-rose-50 p-6 text-rose-700 shadow-sm">Error: {error}</div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl bg-slate-50 p-12 text-center text-slate-600 shadow-sm">Cargando productos...</div>
        ) : (
          <section className="grid gap-6 xl:grid-cols-3">
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => {
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      price: Number(product.price),
                      quantity: 1,
                      stock: product.stock,
                      imageUrl: product.imageUrl,
                      categoryName: product.category.name,
                    });
                  }}
                />
              ))
            ) : (
              <div className="rounded-3xl bg-slate-50 p-12 text-center text-slate-600 shadow-sm">
                No se encontraron productos.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
