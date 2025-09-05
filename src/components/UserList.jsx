import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chat';

export function UserList({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await chatService.getAllUsers();
        setUsers(data);
      } catch (error) {
        setError('Failed to load users. Please try again later.');
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <div
          key={user._id}
          onClick={() => onSelectUser(user)}
          className="user-item"
        >
          {user.name}
        </div>
      ))}
    </div>
  );
}