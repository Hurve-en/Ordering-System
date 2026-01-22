import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const orders = await prisma.order.findMany({
            where: status ? { status: status } : {},
            include: { user: true },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: { user: true },
        });
        if (!order) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prisma.order.update({
            where: { id: Number(id) },
            data: { status },
            include: { user: true },
        });
        res.json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.update({
            where: { id: Number(id) },
            data: { status: "CANCELLED" },
            include: { user: true },
        });
        res.json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
//# sourceMappingURL=adminOrdersController.js.map