import { prisma } from "../index.js";
import { authService } from "./authService.js";
import { AppError } from "../utils/errorHandler.js";
import { IUserInput, IUser } from "../types/index.js";

export const userService = {
  // Create new user
  createUser: async (data: IUserInput): Promise<IUser> => {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, "User already exists with this email", true);
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    return user as unknown as IUser;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<IUser | null> => {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user as unknown as IUser;
  },

  // Get user by email
  getUserByEmail: async (email: string): Promise<IUser | null> => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as unknown as IUser;
  },

  // Update user
  updateUser: async (id: number, data: Partial<IUserInput>): Promise<IUser> => {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
      },
    });
    return user as unknown as IUser;
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<IUser[]> => {
    const users = await prisma.user.findMany();
    return users as unknown as IUser[];
  },
};
