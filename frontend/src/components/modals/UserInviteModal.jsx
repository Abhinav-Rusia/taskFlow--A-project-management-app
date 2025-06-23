import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserInviteModal = ({ isOpen, onClose, projectId, projectTitle, onInviteSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  // Search users with debounce
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/team/search-users?query=${query}`);
      if (response.data.success) {
        setSearchResults(response.data.users || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  // Send invitation
  const handleInvite = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to invite');
      return;
    }

    try {
      setInviting(true);
      const response = await axios.post('/team/invite', {
        email: selectedUser.email,
        projectId,
        message: customMessage
      });

      if (response.data.success) {
        toast.success(`Invitation sent to ${selectedUser.username}!`);
        onInviteSuccess?.();
        handleClose();
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setCustomMessage('');
    onClose();
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  };

  const getAvatarColor = (userId) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const index = userId ? userId.length % colors.length : 0;
    return colors[index];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
            <p className="text-sm text-gray-600">Project: {projectTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Users
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Debounce search
              setTimeout(() => {
                if (e.target.value === searchQuery) {
                  handleSearch(e.target.value);
                }
              }, 500);
            }}
            placeholder="Search by username or email..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Searching users...</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !loading && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User to Invite
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedUser?._id === user._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${getAvatarColor(user._id)} rounded-full flex items-center justify-center text-white text-sm font-medium mr-3`}>
                      {user.profilePicture && user.profilePicture !== 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={user.profilePicture && user.profilePicture !== 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' ? 'hidden' : ''}>
                        {getInitials(user.username)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    {selectedUser?._id === user._id && (
                      <div className="text-blue-600 font-bold">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && !loading && searchResults.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>No users found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Custom Message */}
        {selectedUser && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message to the invitation..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Selected User Preview */}
        {selectedUser && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">Selected User:</p>
            <div className="flex items-center mt-2">
              <div className={`w-6 h-6 ${getAvatarColor(selectedUser._id)} rounded-full flex items-center justify-center text-white text-xs font-medium mr-2`}>
                {getInitials(selectedUser.username)}
              </div>
              <span className="text-blue-900">{selectedUser.username} ({selectedUser.email})</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={!selectedUser || inviting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {inviting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{inviting ? 'Sending...' : 'Send Invitation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInviteModal;
