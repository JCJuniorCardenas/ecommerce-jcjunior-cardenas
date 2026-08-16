'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CART_UPDATED_EVENT, getCartUnitsCount } from '@/lib/cart';
import { SESSION_UPDATED_EVENT, clearSession, getSessionEmail, getSessionRole, getSessionToken } from '@/lib/session';

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      const token = getSessionToken();
      const email = getSessionEmail();
      setUserEmail(token && email ? email : null);
      setIsAdmin(token !== null && getSessionRole() === 'ADMIN');
    };

    const syncCartCount = () => {
      setCartCount(getCartUnitsCount());
    };

    syncUser();
    syncCartCount();

    function handleStorage() {
      syncUser();
      syncCartCount();
    }

    function handleCartUpdated() {
      syncCartCount();
    }

    function handleSessionUpdated() {
      syncUser();
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    window.addEventListener(SESSION_UPDATED_EVENT, handleSessionUpdated);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
      window.removeEventListener(SESSION_UPDATED_EVENT, handleSessionUpdated);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  function handleLogout() {
    clearSession();
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-paper/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="hidden items-center gap-3 text-2xl text-ink md:flex">
            <span className="font-display text-4xl tracking-[0.08em]">Jamby</span>
          </Link>

          <Link href="/" className="flex items-center text-3xl text-ink md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="font-display tracking-[0.08em]">JAMBY</span>
          </Link>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="border border-line bg-paper-soft px-3 py-2 text-2xl leading-none text-ink transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f] md:hidden"
          >
            {isMobileMenuOpen ? '×' : '☰'}
          </button>

          <div className="hidden border border-line bg-paper-soft px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted md:block">
            Urban sneaker drops
          </div>
        </div>

        <nav className="hidden flex-wrap items-center gap-2 border border-line bg-paper-soft p-2 text-sm text-muted shadow-editorial md:flex">
          <Link className="border border-transparent px-4 py-2 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/">
            Productos
          </Link>
          <Link className="border border-transparent px-4 py-2 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/cart">
            Carrito
            {cartCount > 0 ? (
              <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center border border-[#0b0d0f] bg-terracotta px-2 text-xs font-semibold text-[#0b0d0f]">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link className="border border-transparent px-4 py-2 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/orders">
            Pedidos
          </Link>
          {isAdmin ? (
            <>
              <Link className="border border-transparent px-4 py-2 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/admin/orders">
                Admin Pedidos
              </Link>
              <Link className="border border-transparent px-4 py-2 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/admin/products">
                Admin Productos
              </Link>
            </>
          ) : null}
          <Link className="border border-transparent px-4 py-2 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/login">
            Login
          </Link>
          <Link className="border border-transparent px-4 py-2 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/register">
            Registro
          </Link>
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="ml-auto border border-[#0b0d0f] bg-terracotta px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0b0d0f] transition hover:brightness-95"
            >
              Salir
            </button>
          ) : null}
        </nav>

        {isMobileMenuOpen ? (
          <nav className="border border-line bg-paper-soft p-3 text-sm text-muted shadow-editorial md:hidden">
            <div className="flex flex-col gap-2">
              <Link onClick={() => setIsMobileMenuOpen(false)} className="border border-transparent px-4 py-4 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/">
                Productos
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between border border-transparent px-4 py-4 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/cart">
                <span>Carrito</span>
                {cartCount > 0 ? (
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center border border-[#0b0d0f] bg-terracotta px-2 text-xs font-semibold text-[#0b0d0f]">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} className="border border-transparent px-4 py-4 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/orders">
                Pedidos
              </Link>
              {isAdmin ? (
                <>
                  <Link onClick={() => setIsMobileMenuOpen(false)} className="border border-transparent px-4 py-4 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/admin/orders">
                    Admin Pedidos
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} className="border border-transparent px-4 py-4 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/admin/products">
                    Admin Productos
                  </Link>
                </>
              ) : null}
              {!userEmail ? (
                <>
                  <Link onClick={() => setIsMobileMenuOpen(false)} className="border border-transparent px-4 py-4 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/login">
                    Login
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} className="border border-transparent px-4 py-4 font-semibold uppercase tracking-[0.2em] transition hover:border-terracotta hover:bg-terracotta hover:text-[#0b0d0f]" href="/register">
                    Registro
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="border border-[#0b0d0f] bg-terracotta px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-[#0b0d0f] transition hover:brightness-95"
                >
                  Salir
                </button>
              )}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
