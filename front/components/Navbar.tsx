'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCart } from '@/lib/cart';

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('ecommerce_token');
    const email = localStorage.getItem('ecommerce_user_email');
    if (token && email) {
      setUserEmail(email);
    }
    setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    function handleStorage() {
      setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function handleLogout() {
    localStorage.removeItem('ecommerce_token');
    localStorage.removeItem('ecommerce_user_email');
    setUserEmail(null);
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          Ecommerce UI
        </Link>

        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link className="hover:text-slate-900" href="/">
            Productos
          </Link>
          <Link className="hover:text-slate-900" href="/cart">
            Carrito
            {cartCount > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link className="hover:text-slate-900" href="/orders">
            Pedidos
          </Link>
          <Link className="hover:text-slate-900" href="/login">
            Login
          </Link>
          <Link className="hover:text-slate-900" href="/register">
            Registro
          </Link>
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700"
            >
              Salir
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
