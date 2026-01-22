import { prisma } from "../index.js";
import { authService } from "./authService.js";
import { AppError } from "../utils/errorHandler.js";
export const userService = {
    // Create new user
    createUser: async (data) => {
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
        return user;
    },
    // Get user by ID
    getUserById: async (id) => {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        return user;
    },
    // Get user by email
    getUserByEmail: async (email) => {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    },
    // Update user
    updateUser: async (id, data) => {
        const user = await prisma.user.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
            },
        });
        return user;
    },
    // Get all users (admin only)
    getAllUsers: async () => {
        const users = await prisma.user.findMany();
        return users;
    },
};
//# sourceMappingURL=userService.js.map