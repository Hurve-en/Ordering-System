// src/middleware/adminMiddleware.ts
import { Request, Response, NextFunction } from "express";

// Extend Express Request to include user
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

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Check if user exists (should come from authMiddleware)
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Please login first",
      });
      return;
    }

    // Check if user is admin
    if (req.user.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Forbidden - Admin access required",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error in admin middleware",
    });
  }
};
