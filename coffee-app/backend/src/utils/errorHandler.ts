export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: any) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message
    };
  }

  // Default error response
  return {
    statusCode: 500,
    message: 'Internal Server Error'
  };
};

export const createError = (statusCode: number, message: string) => {
  throw new AppError(statusCode, message, true);
};