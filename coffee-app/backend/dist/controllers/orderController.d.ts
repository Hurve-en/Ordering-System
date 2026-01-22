import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare const orderController: {
    createOrder: (req: AuthRequest, res: Response) => Promise<void>;
    getOrderById: (req: AuthRequest, res: Response) => Promise<void>;
    getUserOrders: (req: AuthRequest, res: Response) => Promise<void>;
    getAllOrders: (_req: AuthRequest, res: Response) => Promise<void>;
    updateOrderStatus: (req: AuthRequest, res: Response) => Promise<void>;
    cancelOrder: (req: AuthRequest, res: Response) => Promise<void>;
};
//# sourceMappingURL=orderController.d.ts.map