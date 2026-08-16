'use client';

import { useEffect, useMemo, useState } from 'react';
import { Category, Product, getCategories, getProducts } from '@/lib/api';
import {
  addToCart,
  CART_UPDATED_EVENT,
  getCart,
} from '@/lib/cart';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cartSnapshot, setCartSnapshot] = useState(() => getCart());
  const [stockErrors, setStockErrors] = useState<Record<number, string>>({});

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

  useEffect(() => {
    const syncCart = () => {
      setCartSnapshot(getCart());
    };

    syncCart();
    window.addEventListener('storage', syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory ? product.category.id === activeCategory : true;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const cartQuantitiesByProduct = useMemo(() => {
    return cartSnapshot.reduce<Record<number, number>>((acc, item) => {
      acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
      return acc;
    }, {});
  }, [cartSnapshot]);

  const layoutClasses = [
    'md:col-span-1',
    'md:col-span-1',
    'md:col-span-1',
    'md:col-span-1',
    'md:col-span-1',
    'md:col-span-1',
    'md:col-span-1',
    'md:col-span-1',
  ];

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 border-2 border-line bg-paper-soft p-6 shadow-editorial md:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-terracotta">Jamby urban streetwear</p>
            <h1 className="max-w-2xl font-display text-6xl leading-[0.9] text-ink sm:text-7xl lg:text-8xl">
              Sneakers que pisan fuerte en calle.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">
              Siluetas urbanas, materiales listos para uso diario y drops pensados para combinar con ritmo real.
            </p>
          </div>

          <div className="grid gap-4 self-end border border-line bg-panel p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Piezas visibles</p>
              <p className="mt-2 font-display text-5xl text-terracotta">{filteredProducts.length}</p>
            </div>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.3em] text-muted">Buscar</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Aero, Court, Trail..."
                className="mt-2 w-full border border-line bg-paper px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-terracotta"
              />
            </label>
          </div>

          <div className="col-span-full flex flex-wrap gap-3 border-t-2 border-line pt-3 text-sm">
            <button
              onClick={() => setActiveCategory(null)}
              className={`border px-4 py-2 font-semibold uppercase tracking-[0.16em] transition ${activeCategory === null ? 'border-terracotta bg-terracotta text-[#0b0d0f]' : 'border-line bg-panel text-muted hover:border-terracotta hover:text-terracotta'}`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`border px-4 py-2 font-semibold uppercase tracking-[0.16em] transition ${activeCategory === category.id ? 'border-terracotta bg-terracotta text-[#0b0d0f]' : 'border-line bg-panel text-muted hover:border-terracotta hover:text-terracotta'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <div className="mt-6 border border-[#7a1e26] bg-[#2a1014] p-6 text-[#ff8b95] shadow-editorial">Error: {error}</div>
        ) : null}

        {loading ? (
          <div className="mt-6 border border-line bg-paper-soft p-12 text-center text-muted shadow-editorial">Cargando productos...</div>
        ) : (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                (() => {
                  const usedStock = cartQuantitiesByProduct[product.id] ?? 0;
                  const availableStock = Math.max(product.stock - usedStock, 0);

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      availableStock={availableStock}
                      errorMessage={stockErrors[product.id]}
                      layoutClassName={layoutClasses[(product.id - 1) % layoutClasses.length]}
                      onAddToCart={() => {
                        if (availableStock <= 0) {
                          setStockErrors((current) => ({
                            ...current,
                            [product.id]: 'No hay más stock disponible de este producto',
                          }));
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

                        if (stockErrors[product.id]) {
                          setStockErrors((current) => {
                            const copy = { ...current };
                            delete copy[product.id];
                            return copy;
                          });
                        }
                      }}
                    />
                  );
                })()
              ))
            ) : (
              <div className="col-span-full border border-line bg-paper-soft p-12 text-center text-muted">
                No se encontraron productos.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
