import { IOrder, IOrderInput } from "../types/index.ts";
export declare const orderService: {
    createOrder: (userId: number, data: IOrderInput) => Promise<IOrder>;
    getOrderById: (id: number) => Promise<IOrder | null>;
    getUserOrders: (userId: number) => Promise<IOrder[]>;
    getAllOrders: () => Promise<IOrder[]>;
    updateOrderStatus: (id: number, status: string) => Promise<IOrder>;
    cancelOrder: (id: number) => Promise<IOrder>;
};
//# sourceMappingURL=orderService.d.ts.map