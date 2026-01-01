import { prisma } from '../index';
import { AppError } from '../utils/errorHandler';
import { IOrder, IOrderInput } from '../types';

export const orderService = {
  // Create order
  createOrder: async (userId: string, data: IOrderInput): Promise<IOrder> => {
    const order = await prisma.order.create({
      data: {
        customerId: userId,
        totalPrice: data.totalPrice,
        deliveryAddress: data.deliveryAddress,
        status: 'PENDING',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations
          }))
        }
      }
    });

    return order as unknown as IOrder;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<IOrder | null> => {
    const order = await prisma.order.findUnique({
      where: { id }
    });
    return order as unknown as IOrder;
  },

  // Get user orders
  getUserOrders: async (userId: string): Promise<IOrder[]> => {
    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return orders as unknown as IOrder[];
  },

  // Get all orders (admin)
  getAllOrders: async (): Promise<IOrder[]> => {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return orders as unknown as IOrder[];
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<IOrder> => {
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      throw new AppError(400, `Invalid status: ${status}`, true);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED' }
    });
    return order as unknown as IOrder;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<IOrder> => {
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new AppError(404, 'Order not found', true);
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new AppError(400, `Cannot cancel order with status ${order.status}`, true);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    return updated as unknown as IOrder;
  }
};