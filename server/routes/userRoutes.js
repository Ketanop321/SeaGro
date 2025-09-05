import express from 'express';
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
} from '../controllers/userController.js';
import { protect, requireEmailVerification, userRateLimit } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', userRateLimit(5, 15 * 60 * 1000), forgotPassword); // 5 requests per 15 minutes
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/logout', logoutUser);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changePassword);
router.post('/resend-verification', resendVerificationEmail);

// Routes that require email verification
router.use(requireEmailVerification);

// Add more protected routes here that require email verification

export default router;