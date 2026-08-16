import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELED]: [],
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async cancelExpiredPendingOrders() {
    const timeoutSeconds = Number(process.env.ORDER_PENDING_TIMEOUT_SECONDS ?? 30);

    if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
      console.error('[orders] ORDER_PENDING_TIMEOUT_SECONDS debe ser un número mayor que 0');
      return { canceledCount: 0 };
    }

    const expirationDate = new Date(Date.now() - timeoutSeconds * 1000);

    const result = await this.prisma.$transaction(async (tx) => {
      const expiredOrders = await tx.order.findMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: expirationDate },
        },
        include: { items: true },
      });

      for (const order of expiredOrders) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELED' },
        });
      }

      return { canceledCount: expiredOrders.length };
    });

    if (result.canceledCount > 0) {
      console.log('[orders] pedidos PENDING vencidos cancelados automáticamente', {
        canceledCount: result.canceledCount,
        timeoutSeconds,
      });
    }

    return result;
  }

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

  async confirmPayment(user: any, id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Esta orden ya no está pendiente de pago');
    }

    return this.updateStatus(id, OrderStatus.PROCESSING);
  }

  async updateStatus(id: number, nextStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === nextStatus) {
      throw new BadRequestException(
        `La orden ya se encuentra en estado ${order.status}`,
      );
    }

    if (!validTransitions[order.status].includes(nextStatus)) {
      throw new BadRequestException(
        `No se puede pasar de ${order.status} a ${nextStatus} directamente`,
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: nextStatus },
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
