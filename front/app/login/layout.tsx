import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión | Jamby',
  description: 'Accede a tu cuenta para comprar y seguir tus pedidos en Jamby.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}