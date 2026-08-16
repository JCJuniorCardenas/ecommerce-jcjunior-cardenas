import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carrito | Jamby',
  description: 'Revisa tu carrito, ajusta cantidades y finaliza tu compra en Jamby.',
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}