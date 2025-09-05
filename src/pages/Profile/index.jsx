import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase } from 'lucide-react';
import { ImageUpload } from '../../components/profile/ImageUpload';
import { EditableField } from '../../components/profile/EditableField';
import { ProfileStats } from './components/ProfileStats';
import { ActivityFeed } from './components/ActivityFeed';
import { ProfileSidebar } from './components/ProfileSidebar';

import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export function Profile() {
  const [profile, setProfile] = useState({
    name: 'Sarah Wilson',
    role: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    bio: 'Passionate about building scalable applications and mentoring junior developers.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80',
    connections: 1234,
    projects: 45,
    certifications: 12,
    skills: 'JavaScript, React, Node.js'
  });

  const handleUpdate = (field, value) => {
    setProfile(prev => {
      const updatedProfile = { ...prev, [field]: value };
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  };

  useEffect(() => {
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="relative h-48">
              <ImageUpload
                currentImage={profile.coverImage}
                onImageChange={(image) => handleUpdate('coverImage', image)}
                type="cover"
              />
            </div>
            <div className="px-8 pb-8">
              <div className="relative flex items-end -mt-16 mb-4">
                <ImageUpload
                  currentImage={profile.avatar}
                  onImageChange={(image) => handleUpdate('avatar', image)}
                  type="avatar"
                />
                <div className="ml-6 mb-2">
                  <EditableField
                    value={profile.name}
                    onSave={(value) => handleUpdate('name', value)}
                    label="Name"
                  />
                  <div className="text-gray-600 flex items-center mt-1">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <EditableField
                      value={profile.role}
                      onSave={(value) => handleUpdate('role', value)}
                      label="Role"
                    />
                  </div>
                  <div className="text-gray-600 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <EditableField
                      value={profile.location}
                      onSave={(value) => handleUpdate('location', value)}
                      label="Location"
                    />
                  </div>
                  <div className="text-gray-600 flex items-center mt-1">
                    <EditableField
                      value={profile.skills}
                      onSave={(value) => handleUpdate('skills', value)}
                      label="Skills"
                    />
                  </div>
                </div>
              </div>
              <EditableField
                value={profile.bio}
                onSave={(value) => handleUpdate('bio', value)}
                label="Bio"
                multiline
              />
            </div>
          </div>
          <ProfileStats user={profile} />
          <ActivityFeed />
        </div>
        <div className="lg:col-span-1">
          <ProfileSidebar user={profile} />
        </div>
      </div>
    </div>
  );
}