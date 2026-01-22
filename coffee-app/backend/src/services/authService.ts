import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/errorHandler.js";
import { ITokenPayload } from "../types";

export const authService = {
  // Hash password
  hashPassword: async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  // Compare password
  comparePassword: async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
  },

  // Generate JWT token
  generateToken: (payload: ITokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "15m",
    });
  },

  // Generate refresh token
  generateRefreshToken: (payload: ITokenPayload): string => {
    return jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
      {
        expiresIn: "7d",
      },
    );
  },

  // Verify token
  verifyToken: (token: string): ITokenPayload => {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
      ) as ITokenPayload;
    } catch (error) {
      throw new AppError(401, "Invalid or expired token", true);
    }
  },

  // Verify refresh token
  verifyRefreshToken: (token: string): ITokenPayload => {
    try {
      return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
      ) as ITokenPayload;
    } catch (error) {
      throw new AppError(401, "Invalid or expired refresh token", true);
    }
  },
};
