'use client';

import React, { createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// Simplified form context for now to avoid compatibility issues
const _FormContext = createContext<any>(null);

// Simple form component without react-hook-form integration
interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function Form({ children, onSubmit, className = '' }: FormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}

// Simplified form field
export function FormField({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

// Form label
interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function FormLabel({ children, required = false, className = '' }: FormLabelProps) {
  return (
    <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// Form input
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: { message?: string };
  label?: string;
  required?: boolean;
  description?: string;
}

export function FormInput({
  error,
  label,
  required = false,
  description,
  className = '',
  ...props
}: FormInputProps) {
  const inputId = React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <FormLabel required={required}>
          <label htmlFor={inputId}>{label}</label>
        </FormLabel>
      )}
      
      <input
        id={inputId}
        className={`
          flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
          ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
          placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed 
          disabled:opacity-50 transition-colors
          ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <AnimatePresence>
        {error?.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 text-red-500"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{error.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Form textarea
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: { message?: string };
  label?: string;
  required?: boolean;
  description?: string;
}

export function FormTextarea({
  error,
  label,
  required = false,
  description,
  className = '',
  ...props
}: FormTextareaProps) {
  const textareaId = React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <FormLabel required={required}>
          <label htmlFor={textareaId}>{label}</label>
        </FormLabel>
      )}
      
      <textarea
        id={textareaId}
        className={`
          flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
          ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none 
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-vertical
          ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <AnimatePresence>
        {error?.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 text-red-500"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{error.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Password input with strength indicator
interface PasswordInputProps extends Omit<FormInputProps, 'type'> {
  showStrength?: boolean;
}

export function PasswordInput({
  showStrength = false,
  error,
  label,
  required = false,
  description,
  className = '',
  onChange,
  value,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [strength, setStrength] = React.useState({ score: 0, feedback: [], isStrong: false });
  const inputId = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (showStrength) {
      // Simple password strength check for now
      const score = newValue.length > 8 ? (newValue.length > 12 ? 5 : 3) : 1;
      setStrength({ score, feedback: [], isStrong: score >= 4 });
    }
    onChange?.(e);
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      {label && (
        <FormLabel required={required}>
          <label htmlFor={inputId}>{label}</label>
        </FormLabel>
      )}
      
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`
            flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm 
            ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed 
            disabled:opacity-50 transition-colors
            ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
            ${className}
          `}
          value={value}
          onChange={handleChange}
          {...props}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {showStrength && value && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getStrengthColor(strength.score)} transition-all duration-300`}
                initial={{ width: 0 }}
                animate={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-12">
              {getStrengthText(strength.score)}
            </span>
          </div>
          
          {strength.feedback.length > 0 && (
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {strength.feedback.map((feedback, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <span className="w-1 h-1 bg-gray-400 rounded-full" />
                  <span>{feedback}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <AnimatePresence>
        {error?.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 text-red-500"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{error.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Form select
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: { message?: string };
  label?: string;
  required?: boolean;
  description?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({
  error,
  label,
  required = false,
  description,
  options,
  className = '',
  ...props
}: FormSelectProps) {
  const selectId = React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <FormLabel required={required}>
          <label htmlFor={selectId}>{label}</label>
        </FormLabel>
      )}
      
      <select
        id={selectId}
        className={`
          flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
          ring-offset-background focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed 
          disabled:opacity-50 transition-colors
          ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <AnimatePresence>
        {error?.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 text-red-500"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{error.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Form checkbox
interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: { message?: string };
  label?: string;
  description?: string;
}

export function FormCheckbox({
  error,
  label,
  description,
  className = '',
  ...props
}: FormCheckboxProps) {
  const checkboxId = React.useId();

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          id={checkboxId}
          type="checkbox"
          className={`
            h-4 w-4 rounded border border-input bg-background text-primary 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
      </div>
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <AnimatePresence>
        {error?.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2 text-red-500"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{error.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Form submit button
interface FormSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function FormSubmit({
  children,
  loading = false,
  loadingText = 'Loading...',
  disabled,
  className = '',
  ...props
}: FormSubmitProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium 
        ring-offset-background transition-colors focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
        disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground 
        hover:bg-primary/90 h-10 px-4 py-2
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {loading ? loadingText : children}
    </button>
  );
}

export default {
  Form,
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  PasswordInput,
  FormSelect,
  FormCheckbox,
  FormSubmit,
};
