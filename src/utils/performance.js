import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';

// Custom hooks for performance optimization

// Debounced callback hook
export const useDebounce = (callback, delay) => {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
};

// Throttled callback hook
export const useThrottle = (callback, delay) => {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);

  return throttledCallback;
};

// Debounced value hook
export const useDebounceValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Previous value hook
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// Memoized callback with dependencies
export const useStableCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
};

// Optimized image loading hook
export const useOptimizedImage = (src, placeholder = null) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoading, hasError };
};

// Performance measurement utilities
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }

  // Start timing
  mark(name) {
    const markName = `${name}-start`;
    performance.mark(markName);
    this.marks.set(name, markName);
  }

  // End timing and get duration
  measure(name) {
    const startMark = this.marks.get(name);
    if (!startMark) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const endMark = `${name}-end`;
    performance.mark(endMark);
    
    const measureName = `${name}-duration`;
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    const duration = measure.duration;
    
    this.measures.set(name, duration);
    
    // Clean up marks and measures
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
    
    return duration;
  }

  // Get all measurements
  getAllMeasures() {
    return Object.fromEntries(this.measures);
  }

  // Clear all measurements
  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

// Create global performance monitor
export const performanceMonitor = new PerformanceMonitor();

// Export JSX components from separate files
export { withPerformanceMonitoring, createLazyComponent } from '../components/ui/PerformanceMonitor.jsx';

// Memory usage monitoring
export const getMemoryUsage = () => {
  if ('memory' in performance) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
    };
  }
  return null;
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  console.group('Bundle Analysis');
  
  scripts.forEach(script => {
    console.log(`Script: ${script.src}`);
  });
  
  styles.forEach(style => {
    console.log(`Style: ${style.href}`);
  });
  
  console.groupEnd();
};

// Image optimization utilities
export const getOptimizedImageUrl = (url, width, height, quality = 80) => {
  // This would integrate with your image optimization service
  // For now, return the original URL
  return url;
};

// Preload critical resources
export const preloadResource = (href, as, type = null) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
  
  return () => {
    document.head.removeChild(link);
  };
};

// Critical CSS inlining
export const inlineCriticalCSS = (css) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
};