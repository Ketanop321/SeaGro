import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    trim: true
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  }],
  experience: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    }
  }],
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Institution name cannot exceed 100 characters']
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters']
    },
    field: {
      type: String,
      trim: true,
      maxlength: [100, 'Field of study cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    }
  }],
  social: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String
  },
  preferences: {
    jobAlerts: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'connections'],
      default: 'public'
    }
  },
  stats: {
    profileViews: {
      type: Number,
      default: 0
    },
    connectionsCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
profileSchema.index({ user: 1 });
profileSchema.index({ skills: 1 });
profileSchema.index({ 'preferences.profileVisibility': 1 });

// Virtual for full name from user
profileSchema.virtual('fullName', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name' }
});

// Static method to get profile with user data
profileSchema.statics.getProfileWithUser = function(userId) {
  return this.findOne({ user: userId }).populate('user', 'name email avatar isEmailVerified');
};

// Instance method to increment profile views
profileSchema.methods.incrementViews = function() {
  this.stats.profileViews += 1;
  return this.save();
};

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;