import React from 'react';
import { cn } from '../../utils/cn';

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  color = 'text-teal-600',
  text = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-current',
          sizeClasses[size],
          color,
          className
        )}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader = ({ className = '', lines = 3 }) => {
  return (
    <div className={cn('animate-pulse space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-4 bg-gray-200 rounded',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
};

// Image skeleton
export const ImageSkeleton = ({ className = '', aspectRatio = 'aspect-video' }) => {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', aspectRatio, className)} />
  );
};

// Full page loader
export const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner;