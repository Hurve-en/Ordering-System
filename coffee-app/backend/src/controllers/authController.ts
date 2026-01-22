import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { authService } from "../services/authService.js";
import { userService } from "../services/userService.js";
import { logger } from "../utils/logger.js";

export const authController = {
  // Register new user
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password || !name) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      // Create user
      const user = await userService.createUser({
        email,
        password,
        name,
      });

      // Generate tokens
      const token = authService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = authService.generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.success("User registered", { email });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      logger.error("Registration error", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Registration failed" });
      }
    }
  },

  // Login user
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password required" });
        return;
      }

      // Find user
      const user = await userService.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      // Compare password
      const isPasswordValid = await authService.comparePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      // Generate tokens
      const token = authService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = authService.generateRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.success("User logged in", { email });

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        refreshToken,
      });
    } catch (error) {
      logger.error("Login error", error);
      res.status(500).json({ message: "Login failed" });
    }
  },

  // Refresh token
  refreshToken: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const token = authService.generateToken({
        id: Number(req.user.id),
        email: req.user.email,
        role: req.user.role,
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed",
        token,
      });
    } catch (error) {
      logger.error("Refresh token error", error);
      res.status(500).json({ message: "Token refresh failed" });
    }
  },

  // Get current user
  getCurrentUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const user = await userService.getUserById(req.user.id);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      logger.error("Get user error", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  },
};
