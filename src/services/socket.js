import { io } from 'socket.io-client';
import { config } from '../config/env';
import { handleError, AppError, ErrorTypes } from '../utils/errorHandler';
import { toast } from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.token = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.connectionPromise = null;
  }

  // Initialize socket connection
  async initialize(token) {
    if (!token) {
      throw new AppError(ErrorTypes.AUTHENTICATION, 'Authentication token is required for socket connection');
    }

    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    // If already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.token = token;
    this.isConnecting = true;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Disconnect existing socket if any
        if (this.socket) {
          this.socket.disconnect();
        }

        // Create new socket connection
        this.socket = io(config.socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 5000,
          timeout: 10000,
          forceNew: true
        });

        // Connection event handlers
        this.socket.on('connect', () => {
          console.log('Socket connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Emit authentication
          this.socket.emit('auth', token);
          
          // Show success toast only after reconnection
          if (this.reconnectAttempts > 0) {
            toast.success('Connection restored');
          }
          
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.isConnecting = false;
          
          const appError = new AppError(
            ErrorTypes.NETWORK,
            'Failed to connect to real-time services. Some features may not work properly.'
          );
          
          reject(appError);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, try to reconnect
            this.socket.connect();
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`Socket reconnected after ${attemptNumber} attempts`);
          toast.success('Connection restored');
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`Socket reconnection attempt ${attemptNumber}`);
          this.reconnectAttempts = attemptNumber;
          
          if (attemptNumber === 1) {
            toast.loading('Reconnecting...', { id: 'socket-reconnect' });
          }
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Socket reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('Socket reconnection failed');
          toast.error('Connection failed. Please refresh the page.', { id: 'socket-reconnect' });
        });

        // Authentication events
        this.socket.on('auth_success', () => {
          console.log('Socket authentication successful');
        });

        this.socket.on('auth_error', (error) => {
          console.error('Socket authentication error:', error);
          toast.error('Authentication failed. Please log in again.');
          
          // Clear auth data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        });

        // Error handling
        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
          handleError(new AppError(ErrorTypes.NETWORK, 'Real-time connection error'));
        });

      } catch (error) {
        this.isConnecting = false;
        reject(handleError(error));
      }
    });

    return this.connectionPromise;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if socket is connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Emit event with error handling
  emit(event, data, callback) {
    if (!this.socket?.connected) {
      const error = new AppError(ErrorTypes.NETWORK, 'Not connected to real-time services');
      if (callback) callback(error);
      return false;
    }

    try {
      if (callback) {
        this.socket.emit(event, data, callback);
      } else {
        this.socket.emit(event, data);
      }
      return true;
    } catch (error) {
      const appError = handleError(error);
      if (callback) callback(appError);
      return false;
    }
  }

  // Add event listener with cleanup tracking
  on(event, listener) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on(event, listener);
    
    // Track listeners for cleanup
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  // Remove event listener
  off(event, listener) {
    if (!this.socket) return;

    this.socket.off(event, listener);
    
    // Remove from tracking
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Join room with error handling
  joinRoom(roomId, callback) {
    return this.emit('join-room', { roomId }, (error, response) => {
      if (error) {
        console.error('Failed to join room:', error);
        toast.error('Failed to join chat room');
      } else {
        console.log('Joined room:', roomId);
      }
      
      if (callback) callback(error, response);
    });
  }

  // Leave room
  leaveRoom(roomId, callback) {
    return this.emit('leave-room', { roomId }, (error, response) => {
      if (error) {
        console.error('Failed to leave room:', error);
      } else {
        console.log('Left room:', roomId);
      }
      
      if (callback) callback(error, response);
    });
  }

  // Send message
  sendMessage(content, roomId, callback) {
    return this.emit('send-message', { content, roomId }, (error, response) => {
      if (error) {
        console.error('Failed to send message:', error);
        toast.error('Failed to send message');
      }
      
      if (callback) callback(error, response);
    });
  }

  // Emit typing indicator
  emitTyping(roomId) {
    return this.emit('typing', { roomId });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      // Remove all tracked listeners
      this.eventListeners.forEach((listeners, event) => {
        listeners.forEach(listener => {
          this.socket.off(event, listener);
        });
      });
      this.eventListeners.clear();

      this.socket.disconnect();
      this.socket = null;
    }
    
    this.token = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.connectionPromise = null;
  }

  // Cleanup method
  cleanup() {
    this.disconnect();
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export methods
export const initializeSocket = (token) => socketService.initialize(token);
export const getSocket = () => socketService.getSocket();
export const disconnectSocket = () => socketService.disconnect();
export const isSocketConnected = () => socketService.isConnected();

export { socketService };
export default socketService;