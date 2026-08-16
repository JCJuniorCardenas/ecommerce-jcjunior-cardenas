import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running seed...');

  const sneakerCategories = [
    {
      name: 'Running',
      description: 'Zapatillas ligeras para correr y entrenar con comodidad.',
    },
    {
      name: 'Lifestyle',
      description: 'Modelos urbanos para uso diario con perfil limpio.',
    },
    {
      name: 'Outdoor',
      description: 'Pares resistentes para tracción, senderos y clima variable.',
    },
  ] as const;

  const sneakerProducts = [
    {
      name: 'Aero Pulse Runner',
      category: 'Running',
      description: 'Zapatilla de running con amortiguación reactiva y upper respirable.',
      price: 128.0,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Velocity Drift',
      category: 'Running',
      description: 'Modelo de ritmo constante con planteo ligero y suela responsiva.',
      price: 136.0,
      stock: 35,
      imageUrl:
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Summit Echo',
      category: 'Running',
      description: 'Capacidad de reacción y energía para entrenamientos de mayor intensidad.',
      price: 142.0,
      stock: 28,
      imageUrl:
        'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Cloud Street Low',
      category: 'Lifestyle',
      description: 'Perfil bajo para ciudad, con líneas limpias y suela flexible.',
      price: 112.0,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Court Avenue',
      category: 'Lifestyle',
      description: 'Sneaker de inspiración court, minimal y versátil.',
      price: 118.0,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Studio Knit One',
      category: 'Lifestyle',
      description: 'Malla tejida con ajuste firme y look contemporáneo.',
      price: 126.0,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Trail Ridge',
      category: 'Outdoor',
      description: 'Suela de agarre y refuerzos para uso outdoor ligero.',
      price: 144.0,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Rain Shell Mid',
      category: 'Outdoor',
      description: 'Mid-top repelente al agua con carácter técnico.',
      price: 149.0,
      stock: 50,
      imageUrl:
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
    },
  ] as const;

  const existingCategories = await prisma.category.findMany({ orderBy: { id: 'asc' } });

  for (const category of sneakerCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: { name: category.name, description: category.description },
    });
  }

  const targetCategories = await prisma.category.findMany({
    where: {
      name: { in: sneakerCategories.map((category) => category.name) },
    },
    orderBy: { id: 'asc' },
  });

  const categoryIds = targetCategories.map((category) => category.id);
  const categoryMap = new Map(targetCategories.map((category) => [category.name, category.id]));

  for (const product of sneakerProducts) {
    const categoryId = categoryMap.get(product.category);

    if (!categoryId) {
      continue;
    }

    await prisma.product.upsert({
      where: { name: product.name },
      update: {
        description: product.description,
        price: new Prisma.Decimal(product.price),
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId,
      },
      create: {
        name: product.name,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId,
      },
    });
  }

  const removedProductNames = [
    'Essential Crew Socks',
    'Suede Care Kit',
    'Granite Trek',
    'Solar Ring',
    'Orbit Chain',
    'Neon Ring',
    'Luna Charm Set',
  ];
  const removableProducts = await prisma.product.findMany({
    where: {
      name: { in: removedProductNames },
      orderItems: { none: {} },
    },
  });

  for (const product of removableProducts) {
    await prisma.product.delete({ where: { id: product.id } });
  }

  const removableCategories = existingCategories
    .filter((category) => !categoryIds.includes(category.id))
    .filter((category) => category.name.startsWith('Smoke Category') || category.name === 'Accessories');

  for (const category of removableCategories) {
    const count = await prisma.product.count({ where: { categoryId: category.id } });
    if (count === 0) {
      await prisma.category.delete({ where: { id: category.id } });
    }
  }

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
