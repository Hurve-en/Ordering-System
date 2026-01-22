import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { orderService } from "../services/orderService.js";
import { logger } from "../utils/logger.js";

export const orderController = {
  // Create order
  createOrder: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const { items } = req.body;

      if (!items || items.length === 0) {
        res.status(400).json({ message: "Items are required" });
        return;
      }

      const order = await orderService.createOrder(Number(req.user.id), {
        items,
      });

      logger.success("Order created", {
        orderId: order.id,
        userId: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order,
      });
    } catch (error) {
      logger.error("Create order error", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  },

  // Get order by ID
  getOrderById: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(Number(id));

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      // Check if user owns the order (unless admin)
      if (req.user?.role !== "ADMIN" && order.userId !== req.user?.id) {
        res.status(403).json({ message: "Not authorized" });
        return;
      }

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      logger.error("Get order error", error);
      res.status(500).json({ message: "Failed to get order" });
    }
  },

  // Get user orders
  getUserOrders: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const orders = await orderService.getUserOrders(Number(req.user.id));
      res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      logger.error("Get user orders error", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  },

  // Get all orders (admin)
  getAllOrders: async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      logger.error("Get all orders error", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  },

  // Update order status (admin)
  updateOrderStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ message: "Status is required" });
        return;
      }

      const order = await orderService.updateOrderStatus(Number(id), status);

      logger.success("Order status updated", { orderId: id, status });

      res.status(200).json({
        success: true,
        message: "Order status updated",
        order,
      });
    } catch (error) {
      logger.error("Update order status error", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  },

  // Cancel order
  cancelOrder: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await orderService.cancelOrder(Number(id));

      logger.success("Order cancelled", { orderId: id });

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      logger.error("Cancel order error", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to cancel order" });
      }
    }
  },
};
