import './globals.css';
import { Bebas_Neue, Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display'
});

export const metadata: Metadata = {
  title: 'Jamby | Urban Streetwear Sneakers',
  description: 'Jamby, tienda de zapatillas urbanas con drops de alto impacto y estilo de calle.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${bebas.variable}`}>{children}</body>
    </html>
  );
}
