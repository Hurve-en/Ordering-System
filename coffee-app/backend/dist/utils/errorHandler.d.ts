export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(statusCode: number, message: string, isOperational?: boolean);
}
export declare const handleError: (error: unknown) => {
    statusCode: number;
    message: string;
};
export declare const createError: (statusCode: number, message: string) => never;
//# sourceMappingURL=errorHandler.d.ts.map