import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    if (!decoded.role || !decoded.role.includes("ADMIN")) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
