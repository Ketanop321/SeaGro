# SeaGro - Professional Real-Time Chat & Community Platform

A modern, scalable full-stack application built with React, Node.js, and MongoDB. Features real-time chat, job search, learning resources, bike sharing, and community features.

## 🚀 Features

### Core Features
- **Real-time Chat** - Socket.io powered messaging with typing indicators, message reactions, and file sharing
- **Job Search** - Integration with remote job APIs for finding opportunities
- **Learning Platform** - Curated learning resources and courses
- **Bike Sharing** - Interactive map showing available bikes and stations
- **Community** - Social networking features for professionals
- **News Feed** - Latest tech news and updates
- **Content Sharing** - Share and discover content with the community
- **Todo Management** - Personal task management system

### Technical Features
- **Authentication & Authorization** - JWT-based auth with refresh tokens, email verification, password reset
- **Real-time Communication** - WebSocket connections with automatic reconnection
- **Performance Optimized** - Code splitting, lazy loading, caching, and performance monitoring
- **Error Handling** - Comprehensive error boundaries and user-friendly error messages
- **Security** - Rate limiting, input validation, CORS protection, helmet security headers
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Accessibility** - WCAG compliant components and keyboard navigation

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool with HMR
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time communication
- **React Query** - Server state management and caching
- **React Error Boundary** - Error handling
- **React Helmet** - Document head management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Winston** - Logging
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **TypeScript** - Type checking (optional)
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seagro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/seagro
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your-refresh-secret
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Client URLs
   CLIENT_URL=http://localhost:5173
   CORS_ORIGIN=http://localhost:5173
   
   # API Keys
   VITE_GEMINI_API_KEY=your-gemini-api-key
   VITE_YOUTUBE_API_KEY=your-youtube-api-key
   
   # Email (Optional - for development)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@seagro.com
   ```

4. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev:full
   
   # Or run separately
   npm run server  # Backend only
   npm run dev     # Frontend only
   ```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
Ensure all environment variables are set in your production environment, especially:
- `NODE_ENV=production`
- `MONGODB_URI` (production database)
- `JWT_SECRET` (strong secret key)
- `CORS_ORIGIN` (your production domain)

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `POST /api/users/refresh-token` - Refresh JWT token
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password
- `POST /api/users/verify-email` - Verify email address

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password

### Chat Endpoints
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create new chat room
- `GET /api/chat/rooms/:id/messages` - Get room messages
- `POST /api/chat/rooms/:id/messages` - Send message

## 🔧 Development

### Code Structure
```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat-related components
│   ├── layout/         # Layout components
│   └── ui/             # Basic UI components
├── pages/              # Page components
├── services/           # API and external services
├── utils/              # Utility functions
├── context/            # React context providers
├── config/             # Configuration files
└── assets/             # Static assets

server/
├── controllers/        # Route controllers
├── middleware/         # Express middleware
├── models/            # Database models
├── routes/            # API routes
├── socket/            # Socket.io handlers
├── utils/             # Server utilities
└── config/            # Server configuration
```

### Performance Optimizations

1. **Code Splitting** - Automatic route-based splitting
2. **Lazy Loading** - Components loaded on demand
3. **Caching** - API responses cached with React Query
4. **Image Optimization** - Lazy loading and WebP support
5. **Bundle Analysis** - Webpack bundle analyzer integration
6. **Service Worker** - Offline support and caching

### Security Features

1. **Authentication** - JWT with refresh tokens
2. **Authorization** - Role-based access control
3. **Rate Limiting** - API and user-specific limits
4. **Input Validation** - Server-side validation
5. **CORS Protection** - Configured for production
6. **Security Headers** - Helmet.js integration
7. **Password Security** - Bcrypt hashing with salt

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring & Logging

### Development
- Console logging with Winston
- Performance monitoring
- Error boundaries with detailed logging

### Production
- Structured logging to files
- Error tracking integration ready
- Performance metrics collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

