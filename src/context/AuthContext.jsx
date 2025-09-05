import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/auth';
import { chatService } from '../services/chat';
// MongoDB profile service will be handled through API calls
import { handleError } from '../utils/errorHandler';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const userData = authService.getCurrentUser();

        if (token && userData) {
          setUser(userData);
          
          // Initialize chat service in background
          try {
            await chatService.initialize(token);
          } catch (error) {
            console.warn('Failed to initialize chat service:', error);
            // Don't block auth initialization for chat service failure
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted auth data
        authService.logout();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Sync profile with MongoDB
  const syncProfile = useCallback(async (userData) => {
    try {
      await profileService.updateProfile(userData._id, {
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar_url || userData.avatar
      });
    } catch (error) {
      console.error('Error syncing profile:', error);
      // Don't throw error as this is not critical for auth flow
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      const data = await authService.login(credentials);
      
      // Update state
      setUser(data);
      
      // Sync profile in background
      syncProfile(data).catch(console.error);
      
      // Initialize chat service
      try {
        await chatService.initialize(data.token);
      } catch (error) {
        console.warn('Failed to initialize chat service after login:', error);
      }
      
      toast.success(`Welcome back, ${data.name}!`);
      return data;
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  }, [syncProfile]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const data = await authService.register(userData);
      
      // Update state
      setUser(data);
      
      // Sync profile in background
      syncProfile(data).catch(console.error);
      
      // Initialize chat service
      try {
        await chatService.initialize(data.token);
      } catch (error) {
        console.warn('Failed to initialize chat service after registration:', error);
      }
      
      toast.success(`Welcome to SeaGro, ${data.name}!`);
      return data;
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  }, [syncProfile]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      
      // Cleanup chat service
      chatService.cleanup();
      
      // Clear state
      setUser(null);
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if server call fails
      setUser(null);
      toast.success('Logged out');
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (updates) => {
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
      
      // Sync with MongoDB
      syncProfile(updatedUser).catch(console.error);
      
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  }, [syncProfile]);

  // Change password function
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  }, []);

  // Request password reset
  const requestPasswordReset = useCallback(async (email) => {
    try {
      await authService.requestPasswordReset(email);
      toast.success('Password reset email sent');
    } catch (error) {
      const handledError = handleError(error);
      toast.error(handledError.message);
      throw handledError;
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    return authService.isAuthenticated();
  }, [user]);

  // Context value with memoization
  const contextValue = useMemo(() => ({
    // State
    user,
    loading,
    isInitialized,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset
  }), [
    user,
    loading,
    isInitialized,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset
  ]);

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook with better error handling
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              Go to Login
            </a>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};