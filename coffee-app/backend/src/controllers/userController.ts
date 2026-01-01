import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/userService';
import { logger } from '../utils/logger';

export const userController = {
  // Get user profile
  getProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      const user = await userService.getUserById(req.user.id);
      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      logger.error('Get profile error', error);
      res.status(500).json({ message: 'Failed to get profile' });
    }
  },

  // Update profile
  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      const { name, phone, address, city, postalCode } = req.body;

      const user = await userService.updateUser(req.user.id, {
        name,
        phone,
        address: address || '',
        city: city || '',
        postalCode: postalCode || ''
      });

      logger.success('User profile updated', { userId: req.user.id });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      logger.error('Update profile error', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  },

  // Get all users (admin only)
  getAllUsers: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } catch (error) {
      logger.error('Get all users error', error);
      res.status(500).json({ message: 'Failed to get users' });
    }
  }
};