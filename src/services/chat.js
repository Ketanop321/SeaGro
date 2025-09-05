import { socketService } from './socket';
import { apiService, cachedApiService } from './api';
import { handleError, withErrorHandling } from '../utils/errorHandler';
import debounce from 'lodash.debounce';

class ChatService {
  constructor() {
    this.currentRoom = null;
    this.typingUsers = new Set();
    this.messageCache = new Map();
    this.isInitialized = false;
    
    // Debounced typing indicator
    this.debouncedStopTyping = debounce(() => {
      this.stopTyping();
    }, 3000);
  }

  // Initialize chat service
  async initialize(token) {
    if (this.isInitialized) return;

    try {
      await socketService.initialize(token);
      this.setupSocketListeners();
      this.isInitialized = true;
    } catch (error) {
      throw handleError(error);
    }
  }

  // Setup socket event listeners
  setupSocketListeners() {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Message events
    socket.on('new-message', (message) => {
      this.handleNewMessage(message);
    });

    socket.on('message-updated', (message) => {
      this.handleMessageUpdate(message);
    });

    socket.on('message-deleted', (messageId) => {
      this.handleMessageDelete(messageId);
    });

    // Typing events
    socket.on('user-typing', (data) => {
      this.handleUserTyping(data);
    });

    socket.on('user-stopped-typing', (data) => {
      this.handleUserStoppedTyping(data);
    });

    // Room events
    socket.on('room-joined', (data) => {
      console.log('Joined room:', data.roomId);
      this.currentRoom = data.roomId;
    });

    socket.on('room-left', (data) => {
      console.log('Left room:', data.roomId);
      if (this.currentRoom === data.roomId) {
        this.currentRoom = null;
      }
    });

    socket.on('user-joined-room', (data) => {
      this.handleUserJoinedRoom(data);
    });

    socket.on('user-left-room', (data) => {
      this.handleUserLeftRoom(data);
    });
  }

  // Handle new message
  handleNewMessage(message) {
    // Add to cache
    if (message.room && this.messageCache.has(message.room)) {
      const messages = this.messageCache.get(message.room);
      messages.push(message);
      
      // Keep only last 100 messages in cache
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100);
      }
    }

    // Emit custom event for components to listen
    window.dispatchEvent(new CustomEvent('chat:new-message', { detail: message }));
  }

  // Handle message update
  handleMessageUpdate(updatedMessage) {
    if (updatedMessage.room && this.messageCache.has(updatedMessage.room)) {
      const messages = this.messageCache.get(updatedMessage.room);
      const index = messages.findIndex(msg => msg._id === updatedMessage._id);
      if (index !== -1) {
        messages[index] = updatedMessage;
      }
    }

    window.dispatchEvent(new CustomEvent('chat:message-updated', { detail: updatedMessage }));
  }

  // Handle message delete
  handleMessageDelete(messageId) {
    // Remove from all cached rooms
    this.messageCache.forEach((messages, roomId) => {
      const index = messages.findIndex(msg => msg._id === messageId);
      if (index !== -1) {
        messages.splice(index, 1);
      }
    });

    window.dispatchEvent(new CustomEvent('chat:message-deleted', { detail: { messageId } }));
  }

  // Handle user typing
  handleUserTyping(data) {
    this.typingUsers.add(data.userId);
    window.dispatchEvent(new CustomEvent('chat:user-typing', { detail: data }));
  }

  // Handle user stopped typing
  handleUserStoppedTyping(data) {
    this.typingUsers.delete(data.userId);
    window.dispatchEvent(new CustomEvent('chat:user-stopped-typing', { detail: data }));
  }

  // Handle user joined room
  handleUserJoinedRoom(data) {
    window.dispatchEvent(new CustomEvent('chat:user-joined', { detail: data }));
  }

  // Handle user left room
  handleUserLeftRoom(data) {
    window.dispatchEvent(new CustomEvent('chat:user-left', { detail: data }));
  }

  // API Methods

  // Get all users
  async getAllUsers() {
    return await cachedApiService.get('/chat/users', {}, 300000); // Cache for 5 minutes
  }

  // Get rooms
  async getRooms() {
    return await cachedApiService.get('/chat/rooms', {}, 300000);
  }

  // Get room details
  async getRoomDetails(roomId) {
    return await apiService.get(`/chat/rooms/${roomId}`);
  }

  // Get messages for a room
  async getMessages(roomId, page = 1, limit = 50) {
    const cacheKey = `messages-${roomId}-${page}-${limit}`;
    
    try {
      const data = await apiService.get(`/chat/rooms/${roomId}/messages`, {
        params: { page, limit }
      });

      // Cache messages
      if (!this.messageCache.has(roomId)) {
        this.messageCache.set(roomId, []);
      }
      
      if (page === 1) {
        // Replace cache for first page
        this.messageCache.set(roomId, data.messages || []);
      } else {
        // Prepend for pagination
        const existingMessages = this.messageCache.get(roomId);
        this.messageCache.set(roomId, [...(data.messages || []), ...existingMessages]);
      }

      return data;
    } catch (error) {
      throw handleError(error);
    }
  }

  // Get cached messages
  getCachedMessages(roomId) {
    return this.messageCache.get(roomId) || [];
  }

  // Create room
  async createRoom(roomData) {
    const data = await apiService.post('/chat/rooms', roomData);
    
    // Clear rooms cache
    cachedApiService.removeCacheEntry('/chat/rooms');
    
    return data;
  }

  // Update room
  async updateRoom(roomId, updates) {
    const data = await apiService.put(`/chat/rooms/${roomId}`, updates);
    
    // Clear related caches
    cachedApiService.removeCacheEntry('/chat/rooms');
    cachedApiService.removeCacheEntry(`/chat/rooms/${roomId}`);
    
    return data;
  }

  // Delete room
  async deleteRoom(roomId) {
    await apiService.delete(`/chat/rooms/${roomId}`);
    
    // Clear caches
    cachedApiService.removeCacheEntry('/chat/rooms');
    this.messageCache.delete(roomId);
  }

  // Socket Methods

  // Join room
  async joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      socketService.joinRoom(roomId, (error, response) => {
        if (error) {
          reject(handleError(error));
        } else {
          this.currentRoom = roomId;
          resolve(response);
        }
      });
    });
  }

  // Leave room
  async leaveRoom(roomId) {
    return new Promise((resolve, reject) => {
      socketService.leaveRoom(roomId, (error, response) => {
        if (error) {
          reject(handleError(error));
        } else {
          if (this.currentRoom === roomId) {
            this.currentRoom = null;
          }
          resolve(response);
        }
      });
    });
  }

  // Send message
  async sendMessage(content, roomId = this.currentRoom) {
    if (!roomId) {
      throw new Error('No room specified or joined');
    }

    return new Promise((resolve, reject) => {
      socketService.sendMessage(content, roomId, (error, response) => {
        if (error) {
          reject(handleError(error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Edit message
  async editMessage(messageId, newContent) {
    const data = await apiService.put(`/chat/messages/${messageId}`, {
      content: newContent
    });

    return data;
  }

  // Delete message
  async deleteMessage(messageId) {
    await apiService.delete(`/chat/messages/${messageId}`);
  }

  // Typing indicators
  startTyping(roomId = this.currentRoom) {
    if (!roomId) return;
    
    socketService.emitTyping(roomId);
    this.debouncedStopTyping();
  }

  stopTyping() {
    if (!this.currentRoom) return;
    
    socketService.emit('stop-typing', { roomId: this.currentRoom });
  }

  // Get typing users
  getTypingUsers() {
    return Array.from(this.typingUsers);
  }

  // Utility methods

  // Get current room
  getCurrentRoom() {
    return this.currentRoom;
  }

  // Check if connected
  isConnected() {
    return socketService.isConnected();
  }

  // Clear message cache
  clearMessageCache(roomId = null) {
    if (roomId) {
      this.messageCache.delete(roomId);
    } else {
      this.messageCache.clear();
    }
  }

  // Cleanup
  cleanup() {
    this.currentRoom = null;
    this.typingUsers.clear();
    this.messageCache.clear();
    this.isInitialized = false;
    
    // Cancel debounced functions
    this.debouncedStopTyping.cancel();
  }
}

// Create singleton instance
const chatService = new ChatService();

// Export wrapped methods with error handling
export const chatServiceWithErrorHandling = {
  initialize: withErrorHandling(chatService.initialize.bind(chatService)),
  getAllUsers: withErrorHandling(chatService.getAllUsers.bind(chatService)),
  getRooms: withErrorHandling(chatService.getRooms.bind(chatService)),
  getRoomDetails: withErrorHandling(chatService.getRoomDetails.bind(chatService)),
  getMessages: withErrorHandling(chatService.getMessages.bind(chatService)),
  createRoom: withErrorHandling(chatService.createRoom.bind(chatService)),
  updateRoom: withErrorHandling(chatService.updateRoom.bind(chatService)),
  deleteRoom: withErrorHandling(chatService.deleteRoom.bind(chatService)),
  joinRoom: withErrorHandling(chatService.joinRoom.bind(chatService)),
  leaveRoom: withErrorHandling(chatService.leaveRoom.bind(chatService)),
  sendMessage: withErrorHandling(chatService.sendMessage.bind(chatService)),
  editMessage: withErrorHandling(chatService.editMessage.bind(chatService)),
  deleteMessage: withErrorHandling(chatService.deleteMessage.bind(chatService)),
  
  // Non-async methods
  getCachedMessages: chatService.getCachedMessages.bind(chatService),
  startTyping: chatService.startTyping.bind(chatService),
  stopTyping: chatService.stopTyping.bind(chatService),
  getTypingUsers: chatService.getTypingUsers.bind(chatService),
  getCurrentRoom: chatService.getCurrentRoom.bind(chatService),
  isConnected: chatService.isConnected.bind(chatService),
  clearMessageCache: chatService.clearMessageCache.bind(chatService),
  cleanup: chatService.cleanup.bind(chatService)
};

export { chatService };
export default chatServiceWithErrorHandling;
