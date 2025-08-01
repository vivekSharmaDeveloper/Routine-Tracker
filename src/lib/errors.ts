import { ApiError } from '@/src/types';

// Custom Error Classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
    
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 503);
  }
}

// Error Handler Utility Functions
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
    };
  }

  return {
    error: 'An unexpected error occurred',
    statusCode: 500,
  };
};

// Async Error Handler Wrapper
export const asyncHandler = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      // Log error for debugging
      console.error('Async operation failed:', error);
      throw error;
    });
  };
};

// API Error Response Helper
export const createErrorResponse = (
  error: unknown,
  defaultMessage: string = 'An error occurred'
): Response => {
  // Handle Zod validation errors specifically
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ message: string; path: string[] }> };
    const validationErrors = zodError.issues.map(issue => ({
      message: issue.message,
      path: issue.path
    }));
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: validationErrors,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  const apiError = handleApiError(error);
  
  return new Response(
    JSON.stringify({
      success: false,
      error: apiError.error || defaultMessage,
      message: apiError.message,
    }),
    {
      status: apiError.statusCode || 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

// Client-side Error Handler
export const handleClientError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

// Retry Utility for Failed Operations
export const retry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// Validation Helper
export const validateRequiredFields = (
  data: Record<string, unknown>,
  requiredFields: string[]
): void => {
  const missingFields = requiredFields.filter(
    field => !data[field] || (typeof data[field] === 'string' && !data[field].toString().trim())
  );

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }
};

// Email Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password Validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate Limiting Error
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

// Database Connection Error
export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string = 'Failed to connect to database') {
    super(message);
  }
}

// JWT Errors
export class InvalidTokenError extends AuthenticationError {
  constructor(message: string = 'Invalid or expired token') {
    super(message);
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message: string = 'Token has expired') {
    super(message);
  }
}

// Development vs Production Error Handling
export const isDevelopment = process.env.NODE_ENV === 'development';

export const formatErrorForClient = (error: unknown): ApiError => {
  const baseError = handleApiError(error);

  // In development, return detailed error information
  if (isDevelopment) {
    return baseError;
  }

  // In production, sanitize error messages
  const sanitizedMessages: Record<number, string> = {
    400: 'Bad request',
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Resource not found',
    409: 'Resource conflict',
    429: 'Too many requests',
    500: 'Internal server error',
    503: 'Service unavailable',
  };

  return {
    error: sanitizedMessages[baseError.statusCode || 500] || 'An error occurred',
    statusCode: baseError.statusCode,
  };
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  NetworkError,
  RateLimitError,
  DatabaseConnectionError,
  InvalidTokenError,
  TokenExpiredError,
  handleApiError,
  asyncHandler,
  createErrorResponse,
  handleClientError,
  retry,
  validateRequiredFields,
  validateEmail,
  validatePassword,
  formatErrorForClient,
};
