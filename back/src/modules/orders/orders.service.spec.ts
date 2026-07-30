import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  const mockProduct = { id: 1, name: 'Test product', stock: 5, price: 20 };
  const mockOrder = {
    id: 1,
    userId: 1,
    total: 40,
    status: 'PENDING',
    items: [{ productId: 1, quantity: 2, unitPrice: 20, product: mockProduct }],
  };

  const mockPrisma: any = {
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    mockPrisma.product.findMany.mockReset();
    mockPrisma.product.update.mockReset();
    mockPrisma.product.updateMany.mockReset();
    mockPrisma.order.create.mockReset();
    mockPrisma.order.findMany.mockReset();
    mockPrisma.order.findUnique.mockReset();
    mockPrisma.$transaction.mockReset();
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    service = new OrdersService(mockPrisma as any);
  });

  it('should create an order', async () => {
    mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.order.create.mockResolvedValue(mockOrder);
    mockPrisma.product.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.create({ id: 1 } as any, { items: [{ productId: 1, quantity: 2 }] } as any);

    expect(result).toEqual(mockOrder);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.product.updateMany).toHaveBeenCalledWith({
      where: { id: 1, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
  });

  it('should throw when stock becomes insufficient during transaction', async () => {
    mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.product.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.create({ id: 1 } as any, { items: [{ productId: 1, quantity: 2 }] } as any),
    ).rejects.toThrow(BadRequestException);
    expect(mockPrisma.product.updateMany).toHaveBeenCalledWith({
      where: { id: 1, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
  });

  it('should throw when product does not exist', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);

    await expect(
      service.create({ id: 1 } as any, { items: [{ productId: 1, quantity: 2 }] } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when stock is insufficient', async () => {
    mockPrisma.product.findMany.mockResolvedValue([{ id: 1, name: 'Test', stock: 1, price: 20 }]);

    await expect(
      service.create({ id: 1 } as any, { items: [{ productId: 1, quantity: 2 }] } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should find my orders', async () => {
    mockPrisma.order.findMany.mockResolvedValue([mockOrder]);
    const result = await service.findMyOrders(1);

    expect(result).toEqual([mockOrder]);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  });

  it('should find all orders for admin', async () => {
    mockPrisma.order.findMany.mockResolvedValue([mockOrder]);
    const result = await service.findAll({ role: 'ADMIN' } as any);

    expect(result).toEqual([mockOrder]);
  });

  it('should deny non-admin list all orders', async () => {
    await expect(service.findAll({ role: 'USER' } as any)).rejects.toThrow(ForbiddenException);
  });

  it('should find an order for owner', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
    const result = await service.findOne({ role: 'USER', id: 1 } as any, 1);

    expect(result).toEqual(mockOrder);
  });

  it('should deny order access for non-owner', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
    await expect(service.findOne({ role: 'USER', id: 2 } as any, 1)).rejects.toThrow(ForbiddenException);
  });

  it('should throw when order not found', async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);
    await expect(service.findOne({ role: 'ADMIN', id: 1 } as any, 1)).rejects.toThrow(NotFoundException);
  });
});
