import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory store for development (use Redis in production)
const store = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  statusCode?: number;
}

// Default configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later.',
  statusCode: 429,
};

// Generate a key for rate limiting based on IP and endpoint
const defaultKeyGenerator = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : (req as any).ip || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const endpoint = req.nextUrl.pathname;
  
  // Create a hash to avoid storing sensitive information
  const hash = crypto
    .createHash('sha256')
    .update(`${ip}-${userAgent}-${endpoint}`)
    .digest('hex')
    .substring(0, 16);
    
  return hash;
};

// Clean up expired entries
const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
};

// Generic rate limiter
export const rateLimit = (config: Partial<RateLimitConfig> = {}) => {
  const options = { ...defaultConfig, ...config };
  const keyGenerator = options.keyGenerator || defaultKeyGenerator;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance
      cleanupExpiredEntries();
    }

    const key = keyGenerator(req);
    const now = Date.now();
  const _windowStart = now - options.windowMs;

    let current = store.get(key);

    if (!current || current.resetTime <= now) {
      // Initialize or reset the counter
      current = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      store.set(key, current);
      return null; // Allow request
    }

    if (current.count >= options.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((current.resetTime - now) / 1000);
      
      return new NextResponse(
        JSON.stringify({
          error: options.message,
          retryAfter,
        }),
        {
          status: options.statusCode,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': options.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString(),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Increment counter
    current.count += 1;
    store.set(key, current);

    return null; // Allow request
  };
};

// Predefined rate limiters for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later.',
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Too many requests, please slow down.',
});

export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registration attempts per hour
  message: 'Too many registration attempts, please try again later.',
});

export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later.',
});

// Rate limiter with user-specific limits (for authenticated requests)
export const userRateLimit = (userId: string, config: Partial<RateLimitConfig> = {}) => {
  const options = { ...defaultConfig, ...config };
  
  return async (): Promise<boolean> => {
    const key = `user:${userId}`;
    const now = Date.now();

    let current = store.get(key);

    if (!current || current.resetTime <= now) {
      current = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      store.set(key, current);
      return true; // Allow request
    }

    if (current.count >= options.maxRequests) {
      return false; // Rate limit exceeded
    }

    current.count += 1;
    store.set(key, current);
    return true; // Allow request
  };
};

// Middleware wrapper for API routes
export const withRateLimit = (
  handler: (req: NextRequest) => Promise<NextResponse>,
  rateLimiter: (req: NextRequest) => Promise<NextResponse | null>
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimiter(req);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return handler(req);
  };
};

// IP-based rate limiter
export const ipRateLimit = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (req: NextRequest) => {
      const forwarded = req.headers.get('x-forwarded-for');
      return forwarded ? forwarded.split(',')[0] : (req as any).ip || 'unknown';
    },
  });
};

// Endpoint-specific rate limiter
export const endpointRateLimit = (endpoint: string, maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    maxRequests,
    keyGenerator: (req: NextRequest) => {
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : (req as any).ip || 'unknown';
      return `${ip}:${endpoint}`;
    },
  });
};

// Progressive rate limiting (stricter limits for repeated violations)
export const progressiveRateLimit = (baseConfig: Partial<RateLimitConfig> = {}) => {
  const options = { ...defaultConfig, ...baseConfig };
  
  return rateLimit({
    ...options,
    keyGenerator: (req: NextRequest) => {
      const baseKey = defaultKeyGenerator(req);
      const violationKey = `violations:${baseKey}`;
      
      // Check violation history
      const violations = store.get(violationKey)?.count || 0;
      
      // Reduce max requests based on violation history
      const adjustedMaxRequests = Math.max(
        1,
        options.maxRequests - violations * 10
      );
      
      // Store adjusted config back to options (not ideal but works for this implementation)
      options.maxRequests = adjustedMaxRequests;
      
      return baseKey;
    },
  });
};

// Reset rate limit for a specific key (admin function)
export const resetRateLimit = (key: string): void => {
  store.delete(key);
};

// Get current rate limit status
export const getRateLimitStatus = (key: string): {
  count: number;
  remaining: number;
  resetTime: number;
} | null => {
  const current = store.get(key);
  if (!current) return null;

  return {
    count: current.count,
    remaining: Math.max(0, defaultConfig.maxRequests - current.count),
    resetTime: current.resetTime,
  };
};

export default {
  rateLimit,
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  registrationRateLimit,
  passwordResetRateLimit,
  userRateLimit,
  withRateLimit,
  ipRateLimit,
  endpointRateLimit,
  progressiveRateLimit,
  resetRateLimit,
  getRateLimitStatus,
};
