import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errorHandler.js';
export const authService = {
    // Hash password
    hashPassword: async (password) => {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    },
    // Compare password
    comparePassword: async (password, hashedPassword) => {
        return bcrypt.compare(password, hashedPassword);
    },
    // Generate JWT token
    generateToken: (payload) => {
        return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '15m'
        });
    },
    // Generate refresh token
    generateRefreshToken: (payload) => {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', {
            expiresIn: '7d'
        });
    },
    // Verify token
    verifyToken: (token) => {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        }
        catch (error) {
            throw new AppError(401, 'Invalid or expired token', true);
        }
    },
    // Verify refresh token
    verifyRefreshToken: (token) => {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
        }
        catch (error) {
            throw new AppError(401, 'Invalid or expired refresh token', true);
        }
    }
};
//# sourceMappingURL=authService.js.map