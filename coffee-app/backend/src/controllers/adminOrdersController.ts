import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const orders = await prisma.order.findMany({
      where: status ? { status: status as string } : {},
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
          },
        },
      },
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, order });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    console.error("Update order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
    return res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
