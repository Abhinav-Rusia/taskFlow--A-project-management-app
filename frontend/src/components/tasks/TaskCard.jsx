import { FaEdit, FaTrash, FaUsers, FaComments, FaClock, FaUser, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // ✅ Import useAuth

const TaskCard = ({ task, onEdit, onDelete, onCollaborate }) => {
  const { user, canAssignTasks } = useAuth(); // ✅ Get current user and permissions

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "todo": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isOverdue = () => {
    return new Date(task.dueDate) < new Date() && task.status !== "completed";
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ✅ NEW: Check if current user is assigned to this task
  const isAssignedToMe = () => {
    return task.assignedTo && user && task.assignedTo._id === user._id;
  };

  // ✅ NEW: Get assignment display info
  const getAssignmentDisplay = () => {
    if (!task.assignedTo) {
      return {
        text: "Unassigned",
        icon: <FaUser className="text-gray-400" />,
        className: "text-gray-500 bg-gray-50 border-gray-200"
      };
    }

    const isMe = isAssignedToMe();
    return {
      text: isMe ? "Assigned to me" : `Assigned to ${task.assignedTo.username || task.assignedTo.email}`,
      icon: <FaUserCheck className={isMe ? "text-blue-600" : "text-green-600"} />,
      className: isMe ? "text-blue-700 bg-blue-50 border-blue-200" : "text-green-700 bg-green-50 border-green-200"
    };
  };

  // ✅ NEW: Check if user can edit this task
  const canEditTask = () => {
    if (!user) return false;
    
    // Task creator can always edit
    if (task.createdBy && task.createdBy._id === user._id) return true;
    
    // Assigned user can edit
    if (isAssignedToMe()) return true;
    
    // Project admins can edit
    if (canAssignTasks(task.project?._id)) return true;
    
    return false;
  };

  const assignmentInfo = getAssignmentDisplay();

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${
      isOverdue() ? 'border-red-500 shadow-red-100' :
      task.status === 'completed' ? 'border-green-500' :
      task.status === 'in-progress' ? 'border-blue-500' : 'border-gray-300'
    } ${isAssignedToMe() ? 'ring-2 ring-blue-100' : ''}`}>
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900 truncate mb-1">
            {task.title}
          </h3>
          {/* ✅ NEW: Assignment Badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${assignmentInfo.className}`}>
            {assignmentInfo.icon}
            <span>{assignmentInfo.text}</span>
          </div>
        </div>
        
        <div className="flex space-x-1 ml-4">
          {/* Collaboration Button */}
          {onCollaborate && (
            <button
              onClick={() => onCollaborate(task)}
              className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-colors"
              title="Collaborate"
            >
              <FaUsers size={14} />
            </button>
          )}
          
          {/* Edit Button - Only show if user can edit */}
          {canEditTask() && (
            <button
              onClick={() => onEdit(task)}
              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit task"
            >
              <FaEdit size={14} />
            </button>
          )}
          
          {/* Delete Button - Only show if user can manage */}
          {(canAssignTasks(task.project?._id) || (task.createdBy && task.createdBy._id === user._id)) && (
            <button
              onClick={() => onDelete(task._id)}
              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete task"
            >
              <FaTrash size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {task.description}
      </p>

      {/* Priority and Status Badges */}
      <div className="flex justify-between items-center mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority?.toUpperCase()}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
          {task.status?.replace("-", " ").toUpperCase()}
        </span>
      </div>

      {/* Project and Due Date Info */}
      <div className="text-sm text-gray-500 space-y-2">
        {task.project && (
          <div className="flex justify-between items-center">
            <span className="font-medium">Project:</span>
            <span className="text-gray-700 font-medium truncate ml-2">
              {task.project.title || "Unknown"}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Due Date:</span>
          <div className="flex items-center gap-2">
            {isOverdue() && (
              <span className="text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded">
                OVERDUE
              </span>
            )}
            <span className={`font-medium ${isOverdue() ? "text-red-600" : "text-gray-700"}`}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
            {!isOverdue() && getDaysUntilDue() <= 3 && getDaysUntilDue() > 0 && (
              <span className="text-orange-600 text-xs bg-orange-100 px-2 py-1 rounded">
                {getDaysUntilDue()} days left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Assignment Details and Comments */}
      {(task.assignedTo || (task.comments && task.comments.length > 0)) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Enhanced Assignment Display */}
            {task.assignedTo && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {(task.assignedTo.username || task.assignedTo.email).charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className={`font-medium ${isAssignedToMe() ? 'text-blue-700' : 'text-gray-700'}`}>
                    {task.assignedTo.username || 'Unknown User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {task.assignedTo.email}
                  </div>
                </div>
              </div>
            )}
            
            {/* Comments Count */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center text-sm text-gray-500 gap-1 bg-gray-50 px-2 py-1 rounded">
                <FaComments />
                <span>{task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ ENHANCED: Progress indicator for in-progress tasks */}
      {task.status === 'in-progress' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-medium">In Progress</span>
            <FaClock className="animate-pulse" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" 
              style={{width: '60%'}}
            ></div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Completed indicator */}
      {task.status === 'completed' && (
        <div className="mt-4 flex items-center justify-center text-green-600 bg-green-50 py-2 rounded-lg">
          <FaUserCheck className="mr-2" />
          <span className="text-sm font-medium">Task Completed</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
