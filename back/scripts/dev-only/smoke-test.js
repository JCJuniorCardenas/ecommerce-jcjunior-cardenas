// DEV ONLY: NUNCA ejecutar este script contra la base de datos de producción.
// Crea y modifica usuarios, categorías, productos y pedidos de prueba.

const { PrismaClient } = require('@prisma/client');

const BASE_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

const randomEmail = () => `test+${Date.now()}@example.com`;

async function request(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });
  const body = await res.text();
  let data;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body;
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${path}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log('Starting smoke test...');

  const email = randomEmail();
  const password = 'Password123!';

  console.log('Registering user:', email);
  const register = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  console.log('Registered:', register.id);

  console.log('Logging in...');
  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  let token = login.access_token || login.accessToken || login.token;
  console.log('Token received:', !!token);

  console.log('Promoting user to ADMIN via Prisma...');
  await prisma.user.update({
    where: { id: register.id },
    data: { role: 'ADMIN' },
  });
  console.log('User promoted');

  console.log('Re-logging in as ADMIN to refresh token...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  token = adminLogin.access_token || adminLogin.accessToken || adminLogin.token;
  console.log('Admin token received:', !!token);

  console.log('Creating category...');
  const category = await request('/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: `Smoke Category ${Date.now()}`, description: 'Test category' }),
  });
  console.log('Category created:', category.id);

  console.log('Creating product...');
  const product = await request('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: `Smoke Product ${Date.now()}`,
      description: 'Test product created during smoke test',
      price: 9.99,
      stock: 5,
      categoryId: category.id,
    }),
  });
  console.log('Product created:', product.id);

  console.log('Creating order...');
  const order = await request('/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items: [{ productId: product.id, quantity: 2 }],
    }),
  });
  console.log('Order created:', order.id, 'total:', order.total);

  console.log('Checking user orders...');
  const myOrders = await request('/orders/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Orders count:', myOrders.length);

  console.log('Smoke test completed successfully.');
}

main()
  .catch((error) => {
    console.error('Smoke test failed:', error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });