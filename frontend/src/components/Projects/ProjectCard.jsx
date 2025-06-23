import React from 'react';
import { FaEdit, FaTrash, FaUsers, FaTasks, FaCalendar, FaFlag, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onTeamManagement,
  formatToDDMMYY
}) => {
  const { user } = useAuth();
  const isOwner = project.owner?._id === user?._id;
  const isTeamMember = project.teamMembers?.some(
    member => member._id === user?._id
  );
  const canManage = isOwner;

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">
          {project.title}
        </h3>
        <div className="flex gap-2 ml-4">
          {(isOwner || isTeamMember) && (
            <button
              onClick={() => onTeamManagement(project)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Team Collaboration"
            >
              <FaUsers />
            </button>
          )}
          {canManage && (
            <button
              onClick={() => onEdit(project)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Edit Project"
            >
              <FaEdit />
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => onDelete(project._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Project"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {project.description || 'No description provided'}
      </p>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
          <FaFlag className="inline mr-1" />
          {project.priority}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <FaUsers className="text-xs" />
          <span>{project.teamMembers?.length || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <FaTasks className="text-xs" />
          <span>{project.taskCount || 0} tasks</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {project.startDate && (
          <div className="flex items-center gap-1">
            <FaCalendar className="text-xs" />
            <span>Start: {formatToDDMMYY(project.startDate)}</span>
          </div>
        )}
        {project.dueDate && (
          <div className="flex items-center gap-1">
            <FaCalendar className="text-xs" />
            <span>Due: {formatToDDMMYY(project.dueDate)}</span>
          </div>
        )}
      </div>

      <div className="border-t pt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1 font-medium mb-1">
          <FaUser className="text-xs" />
          <span>Owner: {
            project.owner && typeof project.owner === 'object' 
              ? project.owner.username || project.owner.email || 'Unknown'
              : 'Loading...'
          }</span>
        </div>
        <div className="flex items-center gap-1">
          <FaCalendar className="text-xs" />
          <span>Created: {formatToDDMMYY(project.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
