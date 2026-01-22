import { prisma } from "../index.js";
import { AppError } from "../utils/errorHandler.js";
import { IOrder, IOrderInput } from "../types";

export const orderService = {
  // Create order
  createOrder: async (userId: number, data: IOrderInput): Promise<IOrder> => {
    // Calculate total from items
    const total = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "pending",
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    return order as unknown as IOrder;
  },

  // Get order by ID
  getOrderById: async (id: number): Promise<IOrder | null> => {
    const order = await prisma.order.findUnique({
      where: { id },
    });
    return order as unknown as IOrder;
  },

  // Get user orders
  getUserOrders: async (userId: number): Promise<IOrder[]> => {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders as unknown as IOrder[];
  },

  // Get all orders (admin)
  getAllOrders: async (): Promise<IOrder[]> => {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders as unknown as IOrder[];
  },

  // Update order status
  updateOrderStatus: async (id: number, status: string): Promise<IOrder> => {
    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status.toLowerCase())) {
      throw new AppError(400, `Invalid status: ${status}`, true);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return order as unknown as IOrder;
  },

  // Cancel order
  cancelOrder: async (id: number): Promise<IOrder> => {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new AppError(404, "Order not found", true);
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      throw new AppError(
        400,
        `Cannot cancel order with status ${order.status}`,
        true,
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return updated as unknown as IOrder;
  },
};
