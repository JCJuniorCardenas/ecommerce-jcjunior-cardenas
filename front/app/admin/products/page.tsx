'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import {
  Category,
  createProduct,
  getCategories,
  getProducts,
  Product,
  ProductPayload,
  updateProduct,
  uploadProductImage,
} from '@/lib/api';
import { getSessionRole, redirectToLogin } from '@/lib/session';
import { useRequireAuth } from '@/lib/useRequireAuth';

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
};

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
};

function formFromProduct(product: Product): ProductForm {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    categoryId: String(product.category.id),
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isCheckingAuth, isAuthenticated } = useRequireAuth({ autoRedirect: true });

  useEffect(() => {
    if (isCheckingAuth || !isAuthenticated) return;
    if (getSessionRole() !== 'ADMIN') {
      redirectToLogin('auth-required');
      return;
    }

    Promise.all([getProducts({ page: 1, limit: 50 }), getCategories()])
      .then(([productResponse, categoryResponse]) => {
        setProducts(productResponse.items);
        setCategories(categoryResponse);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [isCheckingAuth, isAuthenticated]);

  function handleFieldChange(field: keyof ProductForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(file ? URL.createObjectURL(file) : editingProduct?.imageUrl ?? null);
  }

  function resetForm() {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setForm(emptyForm);
    setEditingProduct(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  function startEditing(product: Product) {
    setEditingProduct(product);
    setForm(formFromProduct(product));
    setSelectedFile(null);
    setPreviewUrl(product.imageUrl ?? null);
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload: ProductPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: Number(form.categoryId),
    };

    if (!payload.name || !payload.description || !Number.isFinite(payload.price) || !Number.isInteger(payload.stock) || !payload.categoryId) {
      setError('Completá todos los campos con valores válidos.');
      return;
    }

    setSaving(true);
    try {
      const savedProduct = editingProduct
        ? await updateProduct(editingProduct.id, payload)
        : await createProduct(payload);

      let finalProduct = savedProduct;
      if (selectedFile) {
        setUploading(true);
        finalProduct = await uploadProductImage(savedProduct.id, selectedFile);
      }

      setProducts((current) => {
        const exists = current.some((product) => product.id === finalProduct.id);
        return exists
          ? current.map((product) => (product.id === finalProduct.id ? finalProduct : product))
          : [finalProduct, ...current];
      });
      setSuccess(editingProduct ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  if (isCheckingAuth || !isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10">
          <div className="border border-line bg-panel p-10 text-center text-muted">Verificando acceso...</div>
        </main>
      </>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border-2 border-line bg-paper-soft p-6 shadow-editorial lg:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Control room</p>
          <h1 className="mt-2 font-display text-6xl text-ink">Productos</h1>
          <p className="mt-2 text-muted">Gestioná el catálogo, el stock y las imágenes de Jamby.</p>

          {error ? <div className="mt-6 border border-[#7a1e26] bg-[#2a1014] p-4 text-[#ff8b95]">{error}</div> : null}
          {success ? <div className="mt-6 border border-emerald-700 bg-emerald-950 p-4 text-emerald-200">{success}</div> : null}

          <section className="mt-8 border border-line bg-panel p-5 shadow-editorial lg:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted">{editingProduct ? 'Editar producto' : 'Nuevo producto'}</p>
                <h2 className="mt-1 font-display text-3xl text-ink">{editingProduct ? `#${editingProduct.id} ${editingProduct.name}` : 'Sumar una pieza al drop'}</h2>
              </div>
              {editingProduct ? <button type="button" onClick={resetForm} className="border border-line px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-muted hover:border-terracotta hover:text-terracotta">Cancelar edición</button> : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-[1fr_18rem]">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted">Nombre</span>
                  <input required value={form.name} onChange={(event) => handleFieldChange('name', event.target.value)} className="mt-2 w-full border border-line bg-paper px-3 py-3 text-ink outline-none focus:border-terracotta" />
                </label>
                <label className="sm:col-span-2">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted">Descripción</span>
                  <textarea required rows={4} value={form.description} onChange={(event) => handleFieldChange('description', event.target.value)} className="mt-2 w-full resize-y border border-line bg-paper px-3 py-3 text-ink outline-none focus:border-terracotta" />
                </label>
                <label>
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted">Precio</span>
                  <input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => handleFieldChange('price', event.target.value)} className="mt-2 w-full border border-line bg-paper px-3 py-3 text-ink outline-none focus:border-terracotta" />
                </label>
                <label>
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted">Stock</span>
                  <input required min="0" step="1" type="number" value={form.stock} onChange={(event) => handleFieldChange('stock', event.target.value)} className="mt-2 w-full border border-line bg-paper px-3 py-3 text-ink outline-none focus:border-terracotta" />
                </label>
                <label className="sm:col-span-2">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted">Categoría</span>
                  <select required value={form.categoryId} onChange={(event) => handleFieldChange('categoryId', event.target.value)} className="mt-2 w-full border border-line bg-paper px-3 py-3 text-ink outline-none focus:border-terracotta">
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
              </div>

              <div className="border border-line bg-paper-soft p-4">
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-muted">Imagen</span>
                <div className="mt-3 flex aspect-square items-center justify-center overflow-hidden border border-line bg-panel">
                  {previewUrl ? <img src={previewUrl} alt="Preview del producto" className="h-full w-full object-cover" /> : <span className="px-4 text-center text-xs uppercase tracking-[0.15em] text-muted">Sin imagen</span>}
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="mt-4 block w-full text-xs text-muted file:mr-3 file:border file:border-line file:bg-paper file:px-3 file:py-2 file:font-bold file:uppercase file:tracking-[0.1em] file:text-ink" />
                <p className="mt-2 text-xs text-muted">JPG, PNG o WEBP. Máximo 5 MB.</p>
              </div>

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button disabled={saving || uploading} type="submit" className="border border-[#0b0d0f] bg-terracotta px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#0b0d0f] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60">
                  {uploading ? 'Subiendo imagen...' : saving ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Crear producto'}
                </button>
                {!editingProduct ? <button type="button" onClick={resetForm} className="border border-line px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-muted hover:border-terracotta hover:text-terracotta">Limpiar</button> : null}
              </div>
            </form>
          </section>

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted">Inventario</p>
                <h2 className="mt-1 font-display text-3xl text-ink">Todos los productos</h2>
              </div>
              <span className="text-xs uppercase tracking-[0.16em] text-muted">{products.length} items</span>
            </div>

            {loading ? <div className="mt-5 border border-line bg-panel p-10 text-center text-muted">Cargando productos...</div> : null}
            {!loading && !products.length ? <div className="mt-5 border border-line bg-panel p-10 text-center text-muted">No hay productos registrados.</div> : null}

            {!loading && products.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <article key={product.id} className="overflow-hidden border border-line bg-panel shadow-editorial">
                    <div className="aspect-[4/3] bg-paper-soft">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.15em] text-muted">Sin imagen</div>}
                    </div>
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">{product.category?.name ?? 'Sin categoría'}</p>
                      <h3 className="mt-2 font-display text-3xl text-ink">{product.name}</h3>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="font-display text-2xl text-terracotta">${Number(product.price).toFixed(2)}</p>
                          <p className="mt-1 text-sm text-muted">Stock: <strong className="text-ink">{product.stock}</strong></p>
                        </div>
                        <button type="button" onClick={() => startEditing(product)} className="border border-line px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-muted hover:border-terracotta hover:text-terracotta">Editar</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
