import jwt from "jsonwebtoken";
import { AppError } from "../utils/errorHandler.js";
export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new AppError(401, "No token provided", true);
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid token" });
        }
        else if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Authentication error" });
        }
    }
};
export const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({ message: "Admin access required" });
        return;
    }
    next();
};
export const refreshTokenMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new AppError(401, "No refresh token provided", true);
        }
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "your-refresh-secret");
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
};
//# sourceMappingURL=auth.js.map