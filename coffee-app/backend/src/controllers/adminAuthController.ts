import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.role || !user.role.includes("ADMIN")) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access only" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      message: "Admin login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
    });
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      stats: {
        totalOrders,
        totalProducts,
        totalRevenue: totalRevenue._sum?.total || 0,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
