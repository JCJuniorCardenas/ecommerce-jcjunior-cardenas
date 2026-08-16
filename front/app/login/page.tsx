'use client';

import { FormEvent, useEffect, useState } from 'react';
import { login } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/lib/session';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentReason = new URLSearchParams(window.location.search).get('reason');
    setReason(currentReason);
  }, []);

  const sessionMessage =
    reason === 'session-expired'
      ? 'Tu sesión expiró, volvé a iniciar sesión.'
      : reason === 'auth-required'
        ? 'Debes iniciar sesión para continuar.'
        : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      saveSession(response.access_token, response.user.email, response.user.role);
      router.push(response.user.role === 'ADMIN' ? '/admin/orders' : '/');
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
              <p className="text-xs uppercase tracking-[0.35em] text-terracotta">Jamby access</p>
              <h1 className="font-display text-6xl leading-[0.9]">Volvé al drop.</h1>
              <p className="max-w-md text-sm leading-7 text-muted">
                Ingresá para completar compras, revisar pedidos y mantener tu ritmo urbano activo.
              </p>
            </div>
          </section>

          <div className="border border-line bg-panel p-8">
          <h2 className="font-display text-4xl text-ink">Iniciar sesión</h2>
          <p className="mt-2 text-muted">Accede con tu correo y contraseña para hacer pedidos.</p>

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

            {sessionMessage ? (
              <div className="border border-[#5e5b0f] bg-[#24230d] p-4 text-[#e8dd66]">
                {sessionMessage}
              </div>
            ) : null}
            {error ? <div className="border border-[#7a1e26] bg-[#2a1014] p-4 text-[#ff8b95]">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#0b0d0f] bg-terracotta px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#0b0d0f] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Cargando...' : 'Entrar'}
            </button>
          </form>
          </div>
        </div>
      </main>
    </div>
  );
}
