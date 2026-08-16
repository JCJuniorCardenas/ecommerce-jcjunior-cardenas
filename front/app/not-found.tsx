import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-8 border-2 border-line bg-paper-soft p-8 shadow-editorial lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-terracotta">Error 404</p>
            <h1 className="font-display text-6xl leading-[0.9] text-ink sm:text-7xl">Esta página no existe.</h1>
            <p className="max-w-xl text-base leading-7 text-muted">
              Puede que el enlace esté desactualizado o que el producto ya no esté disponible.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 border border-line bg-panel p-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-[#0b0d0f] bg-terracotta px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#0b0d0f] transition hover:brightness-95"
            >
              Volver al catálogo
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center border border-line bg-paper px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-terracotta hover:text-terracotta"
            >
              Ir al carrito
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}