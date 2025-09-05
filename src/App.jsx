import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorFallback } from './components/ui/ErrorFallback';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Login = lazy(() => import('./pages/auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(module => ({ default: module.Register })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Jobs = lazy(() => import('./pages/Jobs').then(module => ({ default: module.Jobs })));
const Learning = lazy(() => import('./pages/Learning').then(module => ({ default: module.Learning })));
const Bikes = lazy(() => import('./pages/Bikes').then(module => ({ default: module.Bikes })));
const Chat = lazy(() => import('./pages/Chat').then(module => ({ default: module.Chat })));
const Community = lazy(() => import('./pages/Community').then(module => ({ default: module.Community })));
const News = lazy(() => import('./pages/News').then(module => ({ default: module.News })));
const Sharing = lazy(() => import('./pages/Sharing').then(module => ({ default: module.Sharing })));
const Todos = lazy(() => import('./pages/Todos').then(module => ({ default: module.Todos })));
const Chatbot = lazy(() => import('./components/chat/Chatbot').then(module => ({ default: module.Chatbot })));
const StartExploring = lazy(() => import('./pages/StartExploring').then(module => ({ default: module.StartExploring })));
const LearnMore = lazy(() => import('./pages/LearnMore').then(module => ({ default: module.LearnMore })));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" />
  </div>
);

// Error boundary for route-level errors
const RouteErrorBoundary = ({ children }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onError={(error, errorInfo) => {
      console.error('Route Error:', error, errorInfo);
      // You could send this to an error reporting service
    }}
  >
    {children}
  </ErrorBoundary>
);

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error, errorInfo) => {
            console.error('App Error:', error, errorInfo);
          }}
        >
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            
            <main className="pt-16">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <RouteErrorBoundary>
                        <Home />
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/login" 
                    element={
                      <RouteErrorBoundary>
                        <Login />
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/register" 
                    element={
                      <RouteErrorBoundary>
                        <Register />
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/profile" 
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/jobs" 
                    element={
                      <RouteErrorBoundary>
                        <Jobs />
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/learning" 
                    element={
                      <RouteErrorBoundary>
                        <Learning />
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/bikes" 
                    element={
                      <RouteErrorBoundary>
                        <Bikes />
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/chat" 
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/community" 
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <Community />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/news" 
                    element={
                      <RouteErrorBoundary>
                        <News />
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/sharing" 
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <Sharing />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    } 
                  />
                  
                  <Route 
                    path="/todos" 
                    element={
                      <RouteErrorBoundary>
                        <ProtectedRoute>
                          <Todos />
                        </ProtectedRoute>
                      </RouteErrorBoundary>
                    } 
                  />

                  <Route 
                    path="/start-exploring" 
                    element={
                      <RouteErrorBoundary>
                        <StartExploring />
                      </RouteErrorBoundary>
                    } 
                  />

                  <Route 
                    path="/learn-more" 
                    element={
                      <RouteErrorBoundary>
                        <LearnMore />
                      </RouteErrorBoundary>
                    } 
                  />

                  {/* 404 Route */}
                  <Route 
                    path="*" 
                    element={
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                          <p className="text-xl text-gray-600 mb-8">Page not found</p>
                          <a
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                          >
                            Go Home
                          </a>
                        </div>
                      </div>
                    } 
                  />
                </Routes>
              </Suspense>
            </main>

            {/* Footer */}
            <Footer />

            {/* Chatbot - Load lazily */}
            <Suspense fallback={null}>
              <Chatbot />
            </Suspense>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
}