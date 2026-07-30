import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: any, createOrderDto: CreateOrderDto) {
    const productIds = createOrderDto.items.map((item) => item.productId);

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('Some products do not exist');
      }

      const orderItemsData = createOrderDto.items.map((item) => {
        const product = products.find((product: any) => product.id === item.productId);
        if (!product) {
          throw new BadRequestException('Product not found');
        }

        if (item.quantity > product.stock) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}`,
          );
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        };
      });

      const total = orderItemsData.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      );

      for (const item of orderItemsData) {
        const product = products.find((product: any) => product.id === item.productId);

        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for product ${product?.name ?? item.productId}`,
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      return createdOrder;
    });

    return result;
  }

  async findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  async findAll(user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access only');
    }

    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  async findOne(user: any, id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role !== 'ADMIN' && order.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }
}
