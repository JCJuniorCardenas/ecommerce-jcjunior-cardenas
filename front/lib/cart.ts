export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
  categoryName?: string;
};

const CART_KEY = 'ecommerce_cart';
export const CART_UPDATED_EVENT = 'ecommerce-cart-updated';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find((entry) => entry.productId === item.productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + item.quantity, item.stock);
  } else {
    cart.push(item);
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: number) {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(productId: number, quantity: number) {
  const cart = getCart().map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.stock) }
      : item,
  );
  saveCart(cart);
  return cart;
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItemQuantity(productId: number) {
  return getCart()
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function getAvailableStock(productId: number, apiStock: number) {
  const used = getCartItemQuantity(productId);
  return Math.max(apiStock - used, 0);
}

export function getCartUnitsCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
