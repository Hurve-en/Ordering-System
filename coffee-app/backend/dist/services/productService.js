import { prisma } from "../index.js";
export const productService = {
    // Get all products
    getAllProducts: async () => {
        const products = await prisma.product.findMany();
        return products;
    },
    // Get product by ID
    getProductById: async (id) => {
        const product = await prisma.product.findUnique({
            where: { id },
        });
        return product;
    },
    // Create product (admin)
    createProduct: async (data) => {
        const product = await prisma.product.create({
            data,
        });
        return product;
    },
    // Update product (admin)
    updateProduct: async (id, data) => {
        const product = await prisma.product.update({
            where: { id },
            data,
        });
        return product;
    },
    // Delete product (admin)
    deleteProduct: async (id) => {
        const product = await prisma.product.delete({
            where: { id },
        });
        return product;
    },
};
//# sourceMappingURL=productService.js.map