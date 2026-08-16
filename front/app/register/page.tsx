'use client';

import { FormEvent, useState } from 'react';
import { register } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(email, password);
      router.push('/login');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-2 border-line bg-paper-soft p-6 shadow-editorial lg:grid-cols-[1fr_0.9fr] lg:p-10">
          <section className="flex flex-col justify-between border border-line bg-panel p-8 text-ink">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-terracotta">Jamby members</p>
              <h1 className="font-display text-6xl leading-[0.9]">Sumate al crew.</h1>
              <p className="max-w-md text-sm leading-7 text-muted">
                Creá tu cuenta para comprar sneakers, guardar pedidos y entrar primero a nuevos lanzamientos.
              </p>
            </div>
          </section>

          <div className="border border-line bg-panel p-8">
          <h2 className="font-display text-4xl text-ink">Crear cuenta</h2>
          <p className="mt-2 text-muted">Regístrate para comenzar a comprar en la tienda.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.3em] text-muted">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-ink outline-none transition focus:border-terracotta"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.3em] text-muted">Contraseña</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="mt-2 w-full border border-line bg-paper px-4 py-3 text-ink outline-none transition focus:border-terracotta"
                />
              </label>
            </div>

            {error ? <div className="border border-[#7a1e26] bg-[#2a1014] p-4 text-[#ff8b95]">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#0b0d0f] bg-terracotta px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#0b0d0f] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Procesando...' : 'Registrar'}
            </button>
          </form>
          </div>
        </div>
      </main>
    </div>
  );
}
