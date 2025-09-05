import Post from '../models/Post.js';
import { logger } from '../utils/logger.js';
import { validateInput } from '../utils/validation.js';

// Get posts (feed)
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.getPostsWithAuthor(
      { visibility: 'public' },
      { page: parseInt(page), limit: parseInt(limit) }
    );
    
    res.json({
      posts,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: posts.length === parseInt(limit)
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to get posts' });
  }
};

// Create post
export const createPost = async (req, res) => {
  try {
    const { content, tags, visibility = 'public' } = req.body;
    
    // Validate input
    const validation = validateInput({ content }, {
      content: { required: true, maxLength: 2000 }
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    const post = await Post.create({
      author: req.user.id,
      content,
      tags: tags || [],
      visibility
    });
    
    // Get post with author info
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name avatar')
      .lean();
    
    logger.info(`Post created by user: ${req.user.id}`);
    res.status(201).json(populatedPost);
  } catch (error) {
    logger.error('Create post error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    res.status(500).json({ message: 'Failed to create post' });
  }
};

// Like post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await post.addLike(req.user.id);
    
    res.json({ message: 'Post liked successfully', likeCount: post.likeCount });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

// Unlike post
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await post.removeLike(req.user.id);
    
    res.json({ message: 'Post unliked successfully', likeCount: post.likeCount });
  } catch (error) {
    logger.error('Unlike post error:', error);
    res.status(500).json({ message: 'Failed to unlike post' });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    
    // Validate input
    const validation = validateInput({ content }, {
      content: { required: true, maxLength: 500 }
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await post.addComment(req.user.id, content);
    
    // Get updated post with populated comments
    const updatedPost = await Post.findById(postId)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar')
      .lean();
    
    res.json({ 
      message: 'Comment added successfully', 
      post: updatedPost 
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await Post.getPostsWithAuthor(
      { author: userId },
      { page: parseInt(page), limit: parseInt(limit) }
    );
    
    res.json({
      posts,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: posts.length === parseInt(limit)
    });
  } catch (error) {
    logger.error('Get user posts error:', error);
    res.status(500).json({ message: 'Failed to get user posts' });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post
    if (!post.author.equals(req.user.id)) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    
    await Post.findByIdAndDelete(postId);
    
    logger.info(`Post deleted: ${postId} by user: ${req.user.id}`);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};