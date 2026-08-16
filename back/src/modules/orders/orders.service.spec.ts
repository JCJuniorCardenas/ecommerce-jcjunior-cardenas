import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
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
      update: jest.fn(),
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
    mockPrisma.order.update.mockReset();
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

  it('should cancel expired pending orders and restore stock', async () => {
    const expiredOrder = {
      id: 7,
      status: 'PENDING',
      items: [{ productId: 1, quantity: 2 }],
    };
    mockPrisma.order.findMany.mockResolvedValue([expiredOrder]);
    mockPrisma.product.update.mockResolvedValue({ ...mockProduct, stock: 7 });
    mockPrisma.order.update.mockResolvedValue({ ...expiredOrder, status: 'CANCELED' });

    const result = await service.cancelExpiredPendingOrders();

    expect(result).toEqual({ canceledCount: 1 });
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { stock: { increment: 2 } },
    });
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { status: 'CANCELED' },
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

  it('should confirm payment for the order owner', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      status: OrderStatus.PENDING,
    });
    mockPrisma.order.update.mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.PROCESSING,
    });

    const result = await service.confirmPayment({ id: 1 } as any, 1);

    expect(result.status).toBe(OrderStatus.PROCESSING);
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.PROCESSING },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  });

  it('should reject payment confirmation from a non-owner', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      status: OrderStatus.PENDING,
    });

    await expect(service.confirmPayment({ id: 2 } as any, 1)).rejects.toThrow(ForbiddenException);
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
  });

  it('should reject payment confirmation when the order is no longer pending', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      status: OrderStatus.PROCESSING,
    });

    await expect(service.confirmPayment({ id: 1 } as any, 1))
      .rejects.toThrow('Esta orden ya no está pendiente de pago');
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
  });

  it('should update a valid order status transition', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 1,
      status: OrderStatus.PENDING,
    });
    mockPrisma.order.update.mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.PROCESSING,
    });

    const result = await service.updateStatus(1, OrderStatus.PROCESSING);

    expect(result.status).toBe(OrderStatus.PROCESSING);
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: OrderStatus.PROCESSING },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  });

  it('should reject an invalid order status transition', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 1,
      status: OrderStatus.PENDING,
    });

    await expect(service.updateStatus(1, OrderStatus.DELIVERED))
      .rejects.toThrow('No se puede pasar de PENDING a DELIVERED directamente');
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
  });

  it('should reject changes from a terminal order status', async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 1,
      status: OrderStatus.DELIVERED,
    });

    await expect(service.updateStatus(1, OrderStatus.CANCELED))
      .rejects.toThrow('No se puede pasar de DELIVERED a CANCELED directamente');
    expect(mockPrisma.order.update).not.toHaveBeenCalled();
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
