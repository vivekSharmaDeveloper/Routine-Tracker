'use client';

import React from 'react';

// Spinner Loading Component
export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'text-blue-600', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${color} ${className}`}
      style={{
        borderTopColor: 'transparent',
        borderRightColor: 'currentColor',
        borderBottomColor: 'currentColor',
        borderLeftColor: 'currentColor',
      }}
    />
  );
};

// Full Page Loading
export const PageLoader: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50'>
    <Spinner size='lg' />
    <p className='mt-4 text-lg text-gray-600'>{message}</p>
  </div>
);

// Button Loading State
export const ButtonLoader: React.FC<{
  children: React.ReactNode;
  loading: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({
  children,
  loading,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className={`relative flex items-center justify-center space-x-2 ${
      loading || disabled ? 'cursor-not-allowed opacity-50' : ''
    } ${className}`}
  >
    {loading && <Spinner size='sm' color='text-current' />}
    <span className={loading ? 'opacity-0' : ''}>{children}</span>
  </button>
);

// Skeleton Loading for cards
export const SkeletonCard: React.FC = () => (
  <div className='animate-pulse rounded-lg border bg-white p-4 shadow-sm'>
    <div className='flex items-center space-x-3'>
      <div className='h-4 w-4 rounded bg-gray-300' />
      <div className='flex-1 space-y-2'>
        <div className='h-4 w-3/4 rounded bg-gray-300' />
        <div className='h-3 w-1/2 rounded bg-gray-200' />
      </div>
      <div className='flex space-x-2'>
        <div className='h-8 w-8 rounded-full bg-gray-300' />
        <div className='h-8 w-8 rounded-full bg-gray-300' />
      </div>
    </div>
    <div className='mt-4 flex space-x-2'>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className='h-8 w-8 rounded-full bg-gray-200' />
      ))}
    </div>
  </div>
);

// Skeleton Loading for habit list
export const HabitListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => (
  <div className='mt-6 space-y-4'>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Text Skeleton
export const TextSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 1, className = '' }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 rounded bg-gray-300 ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

// Loading Overlay
export const LoadingOverlay: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  message?: string;
}> = ({ loading, children, message = 'Loading...' }) => (
  <div className='relative'>
    {children}
    {loading && (
      <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-75'>
        <div className='flex flex-col items-center space-y-2'>
          <Spinner />
          <p className='text-sm text-gray-600'>{message}</p>
        </div>
      </div>
    )}
  </div>
);

// Dots Loading Animation
export const DotsLoader: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`flex space-x-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className='h-2 w-2 animate-bounce rounded-full bg-blue-600'
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

// Progress Bar
export const ProgressBar: React.FC<{
  progress: number;
  className?: string;
  showPercentage?: boolean;
}> = ({ progress, className = '', showPercentage = false }) => (
  <div className={`w-full ${className}`}>
    <div className='flex items-center justify-between'>
      {showPercentage && (
        <span className='text-sm text-gray-600'>{Math.round(progress)}%</span>
      )}
    </div>
    <div className='mt-1 h-2 w-full rounded-full bg-gray-200'>
      <div
        className='h-2 rounded-full bg-blue-600 transition-all duration-300 ease-out'
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

export default {
  Spinner,
  PageLoader,
  ButtonLoader,
  SkeletonCard,
  HabitListSkeleton,
  TextSkeleton,
  LoadingOverlay,
  DotsLoader,
  ProgressBar,
};
