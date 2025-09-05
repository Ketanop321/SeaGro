import React, { useEffect } from 'react';
import { performanceMonitor } from '../../utils/performance';

// HOC for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    useEffect(() => {
      performanceMonitor.mark(`${componentName}-render`);
      
      return () => {
        const duration = performanceMonitor.measure(`${componentName}-render`);
        if (duration > 16) { // More than one frame (16ms)
          console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
        }
      };
    });

    return <WrappedComponent {...props} />;
  };
};

// Lazy loading utilities
export const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props) {
    return (
      <React.Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
};