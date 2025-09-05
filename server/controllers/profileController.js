import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import { validateInput } from '../utils/validation.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let profile = await Profile.getProfileWithUser(userId);
    
    // If profile doesn't exist, create a basic one
    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      profile = await Profile.create({
        user: userId,
        bio: '',
        skills: [],
        experience: [],
        education: []
      });
      
      profile = await Profile.getProfileWithUser(userId);
    }
    
    res.json(profile);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Validate that user can only update their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }
    
    // Validate input
    const validation = validateInput(updates, {
      bio: { maxLength: 500 },
      location: { maxLength: 100 },
      website: { 
        custom: (value) => {
          if (value && !/^https?:\/\/.+/.test(value)) {
            return 'Website must be a valid URL';
          }
          return true;
        }
      }
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      // Create new profile
      profile = await Profile.create({
        user: userId,
        ...updates
      });
    } else {
      // Update existing profile
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          profile[key] = updates[key];
        }
      });
      await profile.save();
    }
    
    // Get updated profile with user data
    const updatedProfile = await Profile.getProfileWithUser(userId);
    
    logger.info(`Profile updated for user: ${userId}`);
    res.json(updatedProfile);
  } catch (error) {
    logger.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get current user's profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let profile = await Profile.getProfileWithUser(userId);
    
    // If profile doesn't exist, create a basic one
    if (!profile) {
      profile = await Profile.create({
        user: userId,
        bio: '',
        skills: [],
        experience: [],
        education: []
      });
      
      profile = await Profile.getProfileWithUser(userId);
    }
    
    res.json(profile);
  } catch (error) {
    logger.error('Get my profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Add experience
export const addExperience = async (req, res) => {
  try {
    const { title, company, startDate, endDate, current, description } = req.body;
    
    // Validate input
    const validation = validateInput({ title, company, startDate }, {
      title: { required: true, maxLength: 100 },
      company: { required: true, maxLength: 100 },
      startDate: { required: true }
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      profile = await Profile.create({ user: req.user.id });
    }
    
    profile.experience.push({
      title,
      company,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      current: current || false,
      description
    });
    
    await profile.save();
    
    const updatedProfile = await Profile.getProfileWithUser(req.user.id);
    res.json(updatedProfile);
  } catch (error) {
    logger.error('Add experience error:', error);
    res.status(500).json({ message: 'Failed to add experience' });
  }
};

// Add education
export const addEducation = async (req, res) => {
  try {
    const { institution, degree, field, startDate, endDate, current } = req.body;
    
    // Validate input
    const validation = validateInput({ institution, degree, startDate }, {
      institution: { required: true, maxLength: 100 },
      degree: { required: true, maxLength: 100 },
      startDate: { required: true }
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      profile = await Profile.create({ user: req.user.id });
    }
    
    profile.education.push({
      institution,
      degree,
      field,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      current: current || false
    });
    
    await profile.save();
    
    const updatedProfile = await Profile.getProfileWithUser(req.user.id);
    res.json(updatedProfile);
  } catch (error) {
    logger.error('Add education error:', error);
    res.status(500).json({ message: 'Failed to add education' });
  }
};