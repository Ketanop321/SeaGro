import React, { useState } from 'react';
import { Image, Send } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

export function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading || !user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setContent('');
      setMediaFile(null);
      onPostCreated();
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-teal-500"
          rows="3"
        />
        <div className="mt-4 flex justify-between items-center">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMediaFile(e.target.files[0])}
              className="hidden"
            />
            <div className="flex items-center space-x-2 text-gray-500 hover:text-teal-500">
              <Image className="w-5 h-5" />
              <span>{mediaFile ? 'Change image' : 'Add image'}</span>
            </div>
          </label>
          <button
            type="submit"
            disabled={loading || !content.trim() || !user}
            className="px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:opacity-50 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}