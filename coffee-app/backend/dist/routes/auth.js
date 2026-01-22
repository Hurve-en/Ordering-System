import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authMiddleware, refreshTokenMiddleware } from "../middleware/auth.js";
const router = Router();
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", refreshTokenMiddleware, authController.refreshToken);
router.get("/me", authMiddleware, authController.getCurrentUser);
export default router;
//# sourceMappingURL=auth.js.map