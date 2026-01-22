import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { corsMiddleware, optionsHandler } from "./middleware/cors.js";
import { globalErrorHandler, notFoundHandler, } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import { logger } from "./utils/logger.js";
// Load environment variables
dotenv.config();
// Initialize Prisma
export const prisma = new PrismaClient();
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
// ============================================================================
// MIDDLEWARE
// ============================================================================
// Security middleware
app.use(helmet());
// CORS middleware
app.use(corsMiddleware);
app.options("*", optionsHandler);
// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// Request logging
app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
});
// ============================================================================
// ROUTES
// ============================================================================
// Health check
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use("/api", routes);
// ============================================================================
// ERROR HANDLING
// ============================================================================
// 404 handler
app.use(notFoundHandler);
// Global error handler
app.use(globalErrorHandler);
// ============================================================================
// SERVER STARTUP
// ============================================================================
async function startServer() {
    try {
        // Check database connection
        await prisma.$connect();
        logger.success("Database connected successfully");
        // Start server
        app.listen(PORT, () => {
            logger.success(`Server running on port ${PORT}`);
            logger.info(`API URL: http://localhost:${PORT}/api`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on("SIGTERM", async () => {
    logger.warn("SIGTERM signal received: closing HTTP server");
    await prisma.$disconnect();
    process.exit(0);
});
process.on("SIGINT", async () => {
    logger.warn("SIGINT signal received: closing HTTP server");
    await prisma.$disconnect();
    process.exit(0);
});
// Start the server
startServer();
//# sourceMappingURL=index.js.map