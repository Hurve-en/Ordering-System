import { userService } from "../services/userService.js";
import { logger } from "../utils/logger.js";
export const userController = {
    // Get user profile
    getProfile: async (req, res) => {
        try {
            if (!req.user) {
                res.status(401).json({ message: "User not found" });
                return;
            }
            const user = await userService.getUserById(Number(req.user.id));
            res.status(200).json({
                success: true,
                user,
            });
        }
        catch (error) {
            logger.error("Get profile error", error);
            res.status(500).json({ message: "Failed to get profile" });
        }
    },
    // Update profile
    updateProfile: async (req, res) => {
        try {
            if (!req.user) {
                res.status(401).json({ message: "User not found" });
                return;
            }
            const { name } = req.body;
            const user = await userService.updateUser(Number(req.user.id), {
                name,
            });
            logger.success("User profile updated", { userId: req.user.id });
            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                user,
            });
        }
        catch (error) {
            logger.error("Update profile error", error);
            res.status(500).json({ message: "Failed to update profile" });
        }
    },
    // Get all users (admin only)
    getAllUsers: async (_req, res) => {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json({
                success: true,
                count: users.length,
                users,
            });
        }
        catch (error) {
            logger.error("Get all users error", error);
            res.status(500).json({ message: "Failed to get users" });
        }
    },
};
//# sourceMappingURL=userController.js.map