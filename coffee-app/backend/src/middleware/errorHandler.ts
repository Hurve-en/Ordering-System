import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler.ts";
import { logger } from "../utils/logger.ts";

export const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  void next;

  logger.error("Error caught by global handler:", error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      success: false,
      message: error.message,
      statusCode: 500,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    statusCode: 500,
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    statusCode: 404,
  });
};
