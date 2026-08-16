import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mis pedidos | Jamby',
  description: 'Consulta el historial y el estado de tus pedidos en Jamby.',
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}