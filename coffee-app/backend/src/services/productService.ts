import { prisma } from '../index';
import { AppError } from '../utils/errorHandler';
import { IProduct, IProductInput } from '../types';

export const productService = {
  // Get all products
  getAllProducts: async (): Promise<IProduct[]> => {
    const products = await prisma.product.findMany();
    return products as unknown as IProduct[];
  },

  // Get product by ID
  getProductById: async (id: string): Promise<IProduct | null> => {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    return product as unknown as IProduct;
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<IProduct[]> => {
    const products = await prisma.product.findMany({
      where: { category }
    });
    return products as unknown as IProduct[];
  },

  // Create product (admin)
  createProduct: async (data: IProductInput): Promise<IProduct> => {
    const product = await prisma.product.create({
      data
    });
    return product as unknown as IProduct;
  },

  // Update product (admin)
  updateProduct: async (id: string, data: Partial<IProductInput>): Promise<IProduct> => {
    const product = await prisma.product.update({
      where: { id },
      data
    });
    return product as unknown as IProduct;
  },

  // Delete product (admin)
  deleteProduct: async (id: string): Promise<IProduct> => {
    const product = await prisma.product.delete({
      where: { id }
    });
    return product as unknown as IProduct;
  },

  // Toggle product availability
  toggleAvailability: async (id: string): Promise<IProduct> => {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError(404, 'Product not found', true);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        isAvailable: !product.isAvailable
      }
    });

    return updated as unknown as IProduct;
  }
};