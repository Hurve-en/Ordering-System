import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const orders = await prisma.order.findMany({
      where: status ? { status: status as string } : {},
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!order)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: true },
    });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { customer: true },
    });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
