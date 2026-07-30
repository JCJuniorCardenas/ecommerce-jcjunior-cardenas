import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  const mockProduct = {
    id: 1,
    name: 'Test product',
    description: 'Description',
    price: 99.9,
    stock: 10,
    categoryId: 1,
    category: { id: 1, name: 'Category' },
  };

  const mockPrisma: any = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService: any = {
    get: jest.fn().mockReturnValue(''),
  };

  beforeEach(() => {
    mockPrisma.product.create.mockReset();
    mockPrisma.product.findMany.mockReset();
    mockPrisma.product.findUnique.mockReset();
    mockPrisma.product.update.mockReset();
    mockPrisma.product.delete.mockReset();
    mockConfigService.get.mockReset();
    mockConfigService.get.mockReturnValue('');
    service = new ProductsService(mockPrisma as any, mockConfigService as any);
  });

  it('should create a product', async () => {
    mockPrisma.product.create.mockResolvedValue(mockProduct);
    const result = await service.create({
      name: 'Test product',
      description: 'Description',
      price: 99.9,
      stock: 10,
      categoryId: 1,
    } as any);

    expect(result).toEqual(mockProduct);
    expect(mockPrisma.product.create).toHaveBeenCalledWith({
      data: {
        name: 'Test product',
        description: 'Description',
        price: 99.9,
        stock: 10,
        categoryId: 1,
      },
      include: { category: true },
    });
  });

  it('should find products', async () => {
    mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
    const result = await service.findAll({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({ page: 1, limit: 10, items: [mockProduct] });
  });

  it('should return a product by id', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    const result = await service.findOne(1);

    expect(result).toEqual(mockProduct);
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { category: true },
    });
  });

  it('should throw when product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a product', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.product.update.mockResolvedValue({ ...mockProduct, name: 'Updated' });

    const result = await service.update(1, { name: 'Updated' } as any);

    expect(result).toEqual({ ...mockProduct, name: 'Updated' });
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Updated' },
      include: { category: true },
    });
  });

  it('should delete a product', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.product.delete.mockResolvedValue(mockProduct);

    const result = await service.remove(1);

    expect(result).toEqual(mockProduct);
    expect(mockPrisma.product.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
