import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware, refreshTokenMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', refreshTokenMiddleware, authController.refreshToken);
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;