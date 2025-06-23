import { useState } from 'react';
import TeamMemberList from './TeamMemberList';
import UserInviteModal from '../modals/UserInviteModal';

const TeamManagement = ({ project, isOwner, onTeamUpdate }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInviteSuccess = () => {
    // Refresh team members list
    onTeamUpdate?.();
  };

  const handleMemberRemoved = (memberId) => {
    // Handle member removal if needed
    onTeamUpdate?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Team Collaboration</h2>
        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Invite Member</span>
          </button>
        )}
      </div>

      <TeamMemberList
        projectId={project._id}
        isOwner={isOwner}
        onMemberRemoved={handleMemberRemoved}
      />

      <UserInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={project._id}
        projectTitle={project.title}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
};

export default TeamManagement;
