import { z } from 'zod';

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/^(?=.*\d)/, 'Password must contain at least one number')
  .regex(
    /^(?=.*[!@#$%^&*(),.?":{}|<>])/,
    'Password must contain at least one special character'
  );

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email must be at least 5 characters long')
  .max(254, 'Email must not exceed 254 characters')
  .toLowerCase()
  .trim();

// User registration schema
export const userRegistrationSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username must not exceed 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
    age: z
      .number()
      .int('Age must be a whole number')
      .min(13, 'You must be at least 13 years old')
      .max(120, 'Age must be realistic')
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// User login schema
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must not exceed 128 characters'),
});

// Habit creation schema
export const habitCreationSchema = z.object({
  name: z
    .string()
    .min(1, 'Habit name is required')
    .max(100, 'Habit name must not exceed 100 characters')
    .trim(),
  goal: z
    .string()
    .min(1, 'Goal is required')
    .max(500, 'Goal must not exceed 500 characters')
    .trim(),
  frequency: z.object({
    type: z.enum(['daily', 'alternate', 'weekly', 'custom'], {
      errorMap: () => ({ message: 'Invalid frequency type' }),
    }),
    days: z
      .array(z.number().int().min(0).max(6))
      .max(7, 'Cannot select more than 7 days')
      .optional(),
    dates: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'))
      .max(365, 'Cannot select more than 365 dates')
      .optional(),
  }),
  specificDays: z
    .array(z.string())
    .max(7, 'Cannot select more than 7 specific days')
    .optional(),
});

// Habit update schema
export const habitUpdateSchema = habitCreationSchema
  .partial()
  .extend({
    id: z.string().min(1, 'Habit ID is required'),
  });

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .max(128, 'Password must not exceed 128 characters'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

// Profile update schema
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .trim()
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  age: z
    .number()
    .int('Age must be a whole number')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Age must be realistic')
    .optional(),
});

// API request validation schemas
export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine((n) => n > 0, 'Page must be greater than 0')
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .default('10'),
});

// Search schema
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query must not exceed 100 characters')
    .trim(),
  ...paginationSchema.shape,
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid start date'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid end date'),
});

// Habit completion schema
export const habitCompletionSchema = z.object({
  habitId: z.string().min(1, 'Habit ID is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid date'),
  status: z.enum(['done', 'rejected', 'later'], {
    errorMap: () => ({ message: 'Invalid completion status' }),
  }),
});

// Generic ID validation
export const idSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// JWT token schema
export const jwtTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters')
    .trim(),
  email: emailSchema,
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters long')
    .max(100, 'Subject must not exceed 100 characters')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters long')
    .max(1000, 'Message must not exceed 1000 characters')
    .trim(),
});

// Environment variables schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().url('Invalid MongoDB URI'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters long'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters long'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

// Type exports for TypeScript
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type HabitCreation = z.infer<typeof habitCreationSchema>;
export type HabitUpdate = z.infer<typeof habitUpdateSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type Search = z.infer<typeof searchSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type HabitCompletion = z.infer<typeof habitCompletionSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;

// Validation helper functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

export const safeValidateInput = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } => {
  const result = schema.safeParse(data);
  return result;
};

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeating characters');
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 1;
    feedback.push('Avoid common patterns and words');
  }

  const isStrong = score >= 5;
  
  return {
    score: Math.max(0, Math.min(5, score)),
    feedback,
    isStrong,
  };
};

export default {
  passwordSchema,
  emailSchema,
  userRegistrationSchema,
  userLoginSchema,
  habitCreationSchema,
  habitUpdateSchema,
  passwordChangeSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  profileUpdateSchema,
  paginationSchema,
  searchSchema,
  dateRangeSchema,
  habitCompletionSchema,
  idSchema,
  jwtTokenSchema,
  contactFormSchema,
  envSchema,
  validateInput,
  safeValidateInput,
  checkPasswordStrength,
};
