import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
const router = Router();
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
export default router;
//# sourceMappingURL=users.js.map