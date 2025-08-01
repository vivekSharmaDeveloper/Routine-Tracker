'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast types
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
    variant?: 'default' | 'destructive';
  }[];
  dismissible?: boolean;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_ALL' };

// Toast reducer
const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
};

// Toast context
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message?: string, options?: Partial<Toast>) => string;
  error: (title: string, message?: string, options?: Partial<Toast>) => string;
  warning: (title: string, message?: string, options?: Partial<Toast>) => string;
  info: (title: string, message?: string, options?: Partial<Toast>) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
      dismissible: toast.dismissible ?? true,
    };

    dispatch({ type: 'ADD_TOAST', payload: newToast });

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const success = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ ...options, type: 'success', title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ 
        ...options, 
        type: 'error', 
        title, 
        message,
        duration: options?.duration ?? 0, // Error toasts don't auto-dismiss by default
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ ...options, type: 'warning', title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ ...options, type: 'info', title, message });
    },
    [addToast]
  );

  const value: ToastContextValue = {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast icon component
const ToastIcon = ({ type }: { type: ToastType }) => {
  const iconProps = { className: 'h-5 w-5', strokeWidth: 2 };

  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="h-5 w-5 text-green-600" />;
    case 'error':
      return <AlertCircle {...iconProps} className="h-5 w-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="h-5 w-5 text-yellow-600" />;
    case 'info':
      return <Info {...iconProps} className="h-5 w-5 text-blue-600" />;
  }
};

// Individual toast component
const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      className={`
        relative flex w-full items-start space-x-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm
        ${getToastStyles(toast.type)}
      `}
    >
      <ToastIcon type={toast.type} />
      
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {toast.message}
          </p>
        )}
        {toast.actions && toast.actions.length > 0 && (
          <div className="flex space-x-2 pt-2">
            {toast.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  onRemove(toast.id);
                }}
                className={`
                  rounded px-3 py-1 text-xs font-medium transition-colors
                  ${
                    action.variant === 'destructive'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {toast.dismissible && (
        <button
          onClick={() => onRemove(toast.id)}
          className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
};

// Toast container
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-start p-6 sm:p-8">
      <div className="flex w-full max-w-sm flex-col space-y-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper function to create toast outside of React components
let toastFn: ToastContextValue | null = null;

export const setToastFunctions = (functions: ToastContextValue) => {
  toastFn = functions;
};

export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    if (toastFn) return toastFn.success(title, message, options);
    return '';
  },
  error: (title: string, message?: string, options?: Partial<Toast>) => {
    if (toastFn) return toastFn.error(title, message, options);
    return '';
  },
  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    if (toastFn) return toastFn.warning(title, message, options);
    return '';
  },
  info: (title: string, message?: string, options?: Partial<Toast>) => {
    if (toastFn) return toastFn.info(title, message, options);
    return '';
  },
};

export default ToastProvider;
