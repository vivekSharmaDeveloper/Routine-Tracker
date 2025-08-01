// Base types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  age?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: Omit<User, 'password'>;
}

// Habit related types
export type FrequencyType = 'daily' | 'alternate' | 'weekly' | 'custom';

export interface HabitFrequency {
  type: FrequencyType;
  days?: number[]; // for weekly: [0, 2, 4] → Sunday, Tuesday, Thursday
  dates?: string[]; // for custom calendar dates like "2025-06-02"
}

export type HabitStatus = 'done' | 'rejected' | 'later';

export interface Habit {
  id: string;
  name: string;
  goal: string;
  completedDates: string[];
  frequency: HabitFrequency;
  specificDays?: string[];
  createdAt: string;
  statusByDate: Record<string, HabitStatus>;
}

export interface CreateHabitRequest {
  name: string;
  goal: string;
  frequency: HabitFrequency;
  specificDays?: string[];
}

export interface UpdateHabitRequest extends Partial<CreateHabitRequest> {
  id: string;
}

// Database Habit model (from MongoDB)
export interface DBHabit {
  _id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  startDate: Date;
  completedDates: Date[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// Redux State types
export interface HabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface RootState {
  habit: HabitState;
  auth: AuthState;
}

// Component Props types
export interface HabitListProps {
  habits?: Habit[];
  onToggleComplete?: (habitId: string, date: string) => void;
  onDelete?: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
}

export interface AddHabitModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (habit: CreateHabitRequest) => void;
}

export interface CalendarProps {
  habit: Habit;
  onDateClick?: (date: string) => void;
  selectedDate?: string;
}

// Form types
export interface HabitFormData {
  name: string;
  goal: string;
  frequency: string;
  specificDays: string[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  username: string;
  confirmPassword: string;
}

// Utility types
export type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface AsyncState<T = unknown> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// Event handler types
export type HabitEventHandlers = {
  onToggleComplete: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onStatusChange: (habitId: string, date: string, status: HabitStatus) => void;
};

// Theme types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
}

// Analytics types
export interface HabitAnalytics {
  habitId: string;
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletionTime?: string;
  weeklyStats: {
    week: string;
    completed: number;
    total: number;
  }[];
}

// Error boundary types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Navigation types
export type NavigationItem = {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
};

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Toast/Notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

// JWT Payload type
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Environment variables type
export interface EnvironmentVariables {
  MONGODB_URI: string;
  JWT_SECRET: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}
