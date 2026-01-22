import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, products });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, roastLevel, grind, size, image, stock } =
      req.body;

    if (!name || !price || !roastLevel || !grind || !size || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, price, roastLevel, grind, size, and image are required",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        roastLevel,
        grind,
        size,
        image,
        stock: stock !== undefined ? parseInt(stock) : 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, roastLevel, grind, size, image, stock } =
      req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(roastLevel && { roastLevel }),
        ...(grind && { grind }),
        ...(size && { size }),
        ...(image && { image }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
      },
    });

    return res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: Number(id) } });
    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    console.error("Delete product error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
