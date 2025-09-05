import express from 'express';
import {
  getPosts,
  createPost,
  likePost,
  unlikePost,
  addComment,
  getUserPosts,
  deletePost
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/user/:userId', getUserPosts);

// Protected routes
router.use(protect);

router.post('/', createPost);
router.post('/:postId/like', likePost);
router.delete('/:postId/like', unlikePost);
router.post('/:postId/comments', addComment);
router.delete('/:postId', deletePost);

export default router;