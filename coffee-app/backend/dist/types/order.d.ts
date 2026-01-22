export interface IOrder {
    id: number;
    userId: number;
    total: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IOrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    createdAt: Date;
}
export interface IOrderInput {
    items: {
        productId: number;
        quantity: number;
        price: number;
    }[];
}
export interface IOrderStatus {
    status: string;
}
//# sourceMappingURL=order.d.ts.map