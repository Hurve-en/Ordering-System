import { Router } from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import productRoutes from "./products.js";
import orderRoutes from "./orders.js";
const router = Router();
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
export default router;
//# sourceMappingURL=index.js.map