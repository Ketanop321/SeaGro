import express from 'express';
import {
  getProfile,
  updateProfile,
  getMyProfile,
  addExperience,
  addEducation
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/me', getMyProfile);
router.get('/:userId', getProfile);
router.put('/:userId', updateProfile);
router.post('/experience', addExperience);
router.post('/education', addEducation);

export default router;