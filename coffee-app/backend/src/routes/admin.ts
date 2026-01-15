import { Router } from "express";
import {
  adminLogin,
  getAdminStats,
} from "../controllers/adminAuthController.js";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/adminProductsController.js";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/adminOrdersController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

// Admin Auth
router.post("/login", adminLogin);

// Protected routes (require admin auth)
router.use(adminMiddleware);

// Dashboard stats
router.get("/stats", getAdminStats);

// Products management
router.get("/products", getAllProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders management
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/cancel", cancelOrder);

export default router;
