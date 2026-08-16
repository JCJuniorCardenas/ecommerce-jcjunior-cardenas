import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear cuenta | Jamby',
  description: 'Regístrate en Jamby para guardar tus compras y gestionar tus pedidos.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}