import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import UserSearch from "./UserSearch";

const InviteModal = ({ isOpen, onClose, project, onInviteSuccess }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUserSelect = (user) => {
    // Check if user is already selected
    if (selectedUsers.find((u) => u._id === user._id)) {
      toast.error("User already selected");
      return;
    }

    // Check if user is already a team member
    if (project.teamMembers?.find((member) => member._id === user._id)) {
      toast.error("User is already a team member");
      return;
    }

    // Check if user is the project owner
    if (project.owner._id === user._id) {
      toast.error("Cannot invite project owner");
      return;
    }

    setSelectedUsers((prev) => [...prev, user]);
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers((prev) => prev.filter((user) => user._id !== userId));
  };

  const handleInvite = async () => {
  if (selectedUsers.length === 0) {
    toast.error('Please select at least one user to invite');
    return;
  }

  try {
    setLoading(true);
    
    // ✅ Send invitations one by one (matching your backend API)
    const invitePromises = selectedUsers.map(user => 
      axios.post(`/team/invite`, {
        projectId: project._id,
        email: user.email,
        message: `You've been invited to join "${project.title}" project`
      })
    );

    await Promise.all(invitePromises);
    
    toast.success(`Successfully invited ${selectedUsers.length} user(s)`);
    setSelectedUsers([]);
    onInviteSuccess();
    onClose();
  } catch (error) {
    console.error('Invite error:', error);
    toast.error(error.response?.data?.message || 'Failed to invite users');
  } finally {
    setLoading(false);
  }
};


  const handleClose = () => {
    setSelectedUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Invite Team Members
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Add members to "{project.title}"
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* User Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <UserSearch
              onUserSelect={handleUserSelect}
              excludeUsers={[
                project.owner._id,
                ...(project.teamMembers?.map((member) => member._id) || []),
                ...selectedUsers.map((user) => user._id),
              ]}
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Users ({selectedUsers.length})
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.username?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUserRemove(user._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={loading || selectedUsers.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Inviting..."
                : `Invite ${selectedUsers.length} User${
                    selectedUsers.length !== 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
