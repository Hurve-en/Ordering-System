import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare const userController: {
    getProfile: (req: AuthRequest, res: Response) => Promise<void>;
    updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
    getAllUsers: (_req: AuthRequest, res: Response) => Promise<void>;
};
//# sourceMappingURL=userController.d.ts.map