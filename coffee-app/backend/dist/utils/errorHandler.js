export class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export const handleError = (error) => {
    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            message: error.message,
        };
    }
    // Default error response
    return {
        statusCode: 500,
        message: "Internal Server Error",
    };
};
export const createError = (statusCode, message) => {
    throw new AppError(statusCode, message, true);
};
//# sourceMappingURL=errorHandler.js.map