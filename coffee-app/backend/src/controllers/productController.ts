import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { productService } from '../services/productService';
import { logger } from '../utils/logger';

export const productController = {
  // Get all products
  getAllProducts: async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      logger.error('Get all products error', error);
      res.status(500).json({ message: 'Failed to get products' });
    }
  },

  // Get product by ID
  getProductById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      res.status(200).json({
        success: true,
        product
      });
    } catch (error) {
      logger.error('Get product error', error);
      res.status(500).json({ message: 'Failed to get product' });
    }
  },

  // Get products by category
  getByCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.params;
      const products = await productService.getProductsByCategory(category);

      res.status(200).json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      logger.error('Get products by category error', error);
      res.status(500).json({ message: 'Failed to get products' });
    }
  },

  // Create product (admin)
  createProduct: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, description, price, image, category } = req.body;

      if (!name || !price || !category) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const product = await productService.createProduct({
        name,
        description,
        price,
        image,
        category
      });

      logger.success('Product created', { productId: product.id });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      logger.error('Create product error', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  },

  // Update product (admin)
  updateProduct: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, price, image, category } = req.body;

      const product = await productService.updateProduct(id, {
        name,
        description,
        price,
        image,
        category
      });

      logger.success('Product updated', { productId: id });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product
      });
    } catch (error) {
      logger.error('Update product error', error);
      res.status(500).json({ message: 'Failed to update product' });
    }
  },

  // Delete product (admin)
  deleteProduct: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      logger.success('Product deleted', { productId: id });

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      logger.error('Delete product error', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  },

  // Toggle availability
  toggleAvailability: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await productService.toggleAvailability(id);

      logger.success('Product availability toggled', { productId: id });

      res.status(200).json({
        success: true,
        message: 'Product availability updated',
        product
      });
    } catch (error) {
      logger.error('Toggle availability error', error);
      res.status(500).json({ message: 'Failed to toggle availability' });
    }
  }
};