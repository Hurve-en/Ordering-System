import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
export declare const authController: {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    refreshToken: (req: AuthRequest, res: Response) => Promise<void>;
    getCurrentUser: (req: AuthRequest, res: Response) => Promise<void>;
};
//# sourceMappingURL=authController.d.ts.map