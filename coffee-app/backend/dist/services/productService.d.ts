import { IProduct, IProductInput } from "../types/product.ts";
export declare const productService: {
    getAllProducts: () => Promise<IProduct[]>;
    getProductById: (id: number) => Promise<IProduct | null>;
    createProduct: (data: IProductInput) => Promise<IProduct>;
    updateProduct: (id: number, data: Partial<IProductInput>) => Promise<IProduct>;
    deleteProduct: (id: number) => Promise<IProduct>;
};
//# sourceMappingURL=productService.d.ts.map