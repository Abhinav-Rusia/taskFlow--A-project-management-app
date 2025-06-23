import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserSearch = ({ onUserSelect, excludeUsers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        searchUsers(searchTerm.trim());
      } else {
        setUsers([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update the searchUsers function (around line 35):
const searchUsers = async (query) => {
  try {
    setLoading(true);
    // ✅ Fixed endpoint to match your backend
    const response = await axios.get(`/team/search-users?q=${encodeURIComponent(query)}`);
         
    if (response.data.success) {
      // Filter out excluded users
      const filteredUsers = response.data.users.filter(
        user => !excludeUsers.includes(user._id)
      );
      setUsers(filteredUsers);
      setShowDropdown(true);
    }
  } catch (error) {
    console.error('Search error:', error);
    if (error.response?.status !== 404) {
      toast.error('Failed to search users');
    }
    setUsers([]);
    setShowDropdown(false);
  } finally {
    setLoading(false);
  }
};


  const handleUserClick = (user) => {
    onUserSelect(user);
    setSearchTerm('');
    setUsers([]);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (users.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search by username or email..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {users.length > 0 ? (
            <div className="py-1">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchTerm.length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
            </div>
          )}
        </div>
      )}

      {/* Search Hint */}
      <p className="mt-1 text-xs text-gray-500">
        Search for users by their username or email address
      </p>
    </div>
  );
};

export default UserSearch;
