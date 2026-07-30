import './globals.css';

export const metadata = {
  title: 'Ecommerce UI',
  description: 'Frontend for the NestJS ecommerce API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
