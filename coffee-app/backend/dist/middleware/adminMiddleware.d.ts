import { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                role: string;
            };
        }
    }
}
export declare const adminMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=adminMiddleware.d.ts.map