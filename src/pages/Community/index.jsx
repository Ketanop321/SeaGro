import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreatePost } from './components/CreatePost';
import { Post } from './components/Post';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <CreatePost onPostCreated={fetchPosts} />
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <Post key={post.id} post={post} onPostUpdated={fetchPosts} />
          ))
        ) : (
          <p className="text-center text-gray-500">No posts yet. Be the first to post!</p>
        )}
      </div>
    </div>
  );
}