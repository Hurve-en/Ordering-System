import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js"; // ✅ One import!

const router = Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
