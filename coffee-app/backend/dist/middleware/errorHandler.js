import { AppError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';
export const globalErrorHandler = (error, _req, res, next) => {
    void next;
    logger.error('Error caught by global handler:', error);
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
            statusCode: error.statusCode
        });
        return;
    }
    if (error instanceof Error) {
        res.status(500).json({
            success: false,
            message: error.message,
            statusCode: 500
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        statusCode: 500
    });
};
export const notFoundHandler = (_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        statusCode: 404
    });
};
//# sourceMappingURL=errorHandler.js.map