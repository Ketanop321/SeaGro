import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import { ErrorFallback } from './components/ui/ErrorFallback';
import { performanceMonitor } from './utils/performance';
import './index.css';

// Performance monitoring
if (import.meta.env.DEV) {
  performanceMonitor.mark('app-init');
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // You could send this to an error reporting service
});

// Global error handler for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // You could send this to an error reporting service
});

// Service Worker registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Render app with error boundary
root.render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Root Error Boundary caught an error:', error, errorInfo);
        // You could send this to an error reporting service
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Performance monitoring
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    const duration = performanceMonitor.measure('app-init');
    console.log(`App initialization took ${duration.toFixed(2)}ms`);
    
    // Log performance metrics
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      console.log('Performance metrics:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      });
    }
  });
}