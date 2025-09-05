import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    minlength: [1, 'Room name must be at least 1 character long'],
    maxlength: [100, 'Room name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['public', 'private', 'direct'],
    default: 'public'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowInvites: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 100,
      min: 2,
      max: 1000
    },
    messageRetention: {
      type: Number,
      default: 0 // 0 means forever, otherwise days
    }
  },
  avatar: String,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
roomSchema.index({ name: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ 'members.user': 1 });
roomSchema.index({ createdBy: 1 });
roomSchema.index({ isActive: 1 });
roomSchema.index({ lastActivity: -1 });

// Virtual for member count
roomSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for online members (you'd need to track this separately)
roomSchema.virtual('onlineCount').get(function() {
  // This would be calculated based on socket connections
  return 0;
});

// Pre-save middleware to update lastActivity
roomSchema.pre('save', function(next) {
  if (this.isModified('members') || this.isNew) {
    this.lastActivity = new Date();
  }
  next();
});

// Instance method to add member
roomSchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(m => m.user.equals(userId));
  if (existingMember) {
    return Promise.resolve(this);
  }

  // Check member limit
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Room has reached maximum member limit');
  }

  this.members.push({
    user: userId,
    role,
    joinedAt: new Date(),
    lastSeen: new Date()
  });

  this.lastActivity = new Date();
  return this.save();
};

// Instance method to remove member
roomSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => !m.user.equals(userId));
  this.lastActivity = new Date();
  return this.save();
};

// Instance method to update member role
roomSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.user.equals(userId));
  if (member) {
    member.role = newRole;
    this.lastActivity = new Date();
    return this.save();
  }
  throw new Error('Member not found');
};

// Instance method to update member last seen
roomSchema.methods.updateMemberLastSeen = function(userId) {
  const member = this.members.find(m => m.user.equals(userId));
  if (member) {
    member.lastSeen = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to check if user is member
roomSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.equals(userId));
};

// Instance method to check if user is admin or moderator
roomSchema.methods.canModerate = function(userId) {
  const member = this.members.find(m => m.user.equals(userId));
  return member && (member.role === 'admin' || member.role === 'moderator');
};

// Instance method to increment message count
roomSchema.methods.incrementMessageCount = function() {
  this.messageCount += 1;
  this.lastActivity = new Date();
  return this.save();
};

// Static method to find rooms for user
roomSchema.statics.findRoomsForUser = function(userId) {
  return this.find({
    'members.user': userId,
    isActive: true
  })
  .populate('members.user', 'name avatar')
  .populate('createdBy', 'name avatar')
  .sort({ lastActivity: -1 });
};

// Static method to find public rooms
roomSchema.statics.findPublicRooms = function(limit = 20) {
  return this.find({
    type: 'public',
    'settings.isPublic': true,
    isActive: true
  })
  .populate('createdBy', 'name avatar')
  .sort({ memberCount: -1, lastActivity: -1 })
  .limit(limit);
};

// Static method to search rooms
roomSchema.statics.searchRooms = function(query, limit = 20) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    type: 'public',
    'settings.isPublic': true,
    isActive: true
  })
  .populate('createdBy', 'name avatar')
  .sort({ memberCount: -1, lastActivity: -1 })
  .limit(limit);
};

const Room = mongoose.model('Room', roomSchema);
export default Room;