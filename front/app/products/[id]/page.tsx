import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import type { Product } from '@/lib/api';

type ProductRouteParams = {
  id: string;
};

type ProductPageProps = {
  params: Promise<ProductRouteParams>;
};

async function getBaseUrl() {
  const hdrs = await headers();
  const host = hdrs.get('host');
  const protocol = hdrs.get('x-forwarded-proto') ?? 'http';

  if (!host) {
    return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
  }

  return `${protocol}://${host}`;
}

async function fetchProductById(id: string): Promise<Product | null> {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/api/products/${numericId}`, {
    cache: 'no-store',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('No se pudo cargar el producto');
  }

  return res.json();
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    return {
      title: 'Producto no encontrado | Jamby',
      description: 'El producto que buscabas no está disponible en Jamby.',
    };
  }

  return {
    title: `${product.name} | Jamby`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
