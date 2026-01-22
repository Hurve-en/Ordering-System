import { prisma } from "../index.ts";
import { IProduct, IProductInput } from "../types/product.ts";

export const productService = {
  // Get all products
  getAllProducts: async (): Promise<IProduct[]> => {
    const products = await prisma.product.findMany();
    return products as unknown as IProduct[];
  },

  // Get product by ID
  getProductById: async (id: number): Promise<IProduct | null> => {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product as unknown as IProduct;
  },

  // Create product (admin)
  createProduct: async (data: IProductInput): Promise<IProduct> => {
    const product = await prisma.product.create({
      data,
    });
    return product as unknown as IProduct;
  },

  // Update product (admin)
  updateProduct: async (
    id: number,
    data: Partial<IProductInput>,
  ): Promise<IProduct> => {
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return product as unknown as IProduct;
  },

  // Delete product (admin)
  deleteProduct: async (id: number): Promise<IProduct> => {
    const product = await prisma.product.delete({
      where: { id },
    });
    return product as unknown as IProduct;
  },
};
