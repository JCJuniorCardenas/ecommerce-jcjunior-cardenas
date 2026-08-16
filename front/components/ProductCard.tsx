'use client';

import { useState } from 'react';
import { Product } from '@/lib/api';

const productImageFallbacks: Record<string, string> = {
  'Aero Pulse Runner': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  'Cloud Street Low': 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80',
  'Tempo Glide Pro': 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80',
  'Court Avenue': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80',
  'Studio Knit One': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80',
  'Metro Suede': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
  'Trail Ridge': 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80',
  'Rain Shell Mid': 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80',
};

export default function ProductCard({
  product,
  onAddToCart,
  layoutClassName,
  availableStock,
  errorMessage,
}: {
  product: Product;
  onAddToCart?: () => void;
  layoutClassName?: string;
  availableStock: number;
  errorMessage?: string;
}) {
  const [imageSrc, setImageSrc] = useState(product.imageUrl || productImageFallbacks[product.name] || '');

  return (
    <article
      className={`group flex h-[36rem] w-full flex-col overflow-hidden border-2 border-line bg-paper-soft shadow-editorial transition duration-300 hover:-translate-y-1 ${layoutClassName ?? ''}`}
    >
      <div className="relative overflow-hidden border-b-2 border-line bg-panel">
        {imageSrc ? (
          <div className="flex h-[23rem] items-center justify-center overflow-hidden bg-paper transition-shadow duration-500 group-hover:shadow-[inset_0_0_0_1px_rgba(214,255,0,0.35)] sm:h-[25rem]">
            <img
              src={imageSrc}
              alt={product.name}
              loading="eager"
              onError={() => {
                const fallback = productImageFallbacks[product.name];
                if (fallback && imageSrc !== fallback) {
                  setImageSrc(fallback);
                  return;
                }
                setImageSrc('');
              }}
              className="h-full w-full object-contain object-center px-5 py-4 transition duration-700 group-hover:scale-[1.05] group-hover:drop-shadow-[0_14px_24px_rgba(0,0,0,0.5)]"
            />
          </div>
        ) : (
          <div className="flex h-[23rem] items-center justify-center bg-paper text-sm uppercase tracking-[0.2em] text-muted sm:h-[25rem]">
            {product.name}
          </div>
        )}
        <span className="absolute left-3 top-3 border border-[#0b0d0f] bg-terracotta px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0b0d0f]">
          {availableStock} stock
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-muted">{product.category.name}</span>
            <span className="border border-line bg-panel px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              drop ready
            </span>
          </div>

          <div className="min-h-[6.75rem]">
            <h3 className="font-display text-3xl leading-none text-ink">{product.name}</h3>
            <p className="mt-2 overflow-hidden text-sm leading-6 text-muted line-clamp-3">{product.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-line pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Precio</p>
            <span className="font-display text-4xl text-terracotta">
              ${typeof product.price === 'string' ? product.price : product.price.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={availableStock === 0}
          className="w-full border border-[#0b0d0f] bg-terracotta px-4 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#0b0d0f] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {availableStock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
        {errorMessage ? (
          <p className="border border-[#7a1e26] bg-[#2a1014] px-3 py-2 text-xs font-semibold text-[#ff8b95]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </article>
  );
}
