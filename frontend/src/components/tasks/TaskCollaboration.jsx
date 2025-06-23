import { useState, useEffect } from 'react';
import { FaTimes, FaUsers, FaComments, FaPlus, FaPaperPlane, FaUserCheck } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const TaskCollaboration = ({ task, isOpen, onClose, onTaskUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  useEffect(() => {
    if (isOpen && task) {
      fetchTaskComments();
      fetchProjectTeamMembers();
    }
  }, [isOpen, task]);

  const fetchTaskComments = async () => {
    try {
      const response = await axios.get(`/api/tasks/${task._id}/comments`);
      if (response.data.success) {
        setComments(response.data.comments || []);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
    }
  };

  const fetchProjectTeamMembers = async () => {
    if (!task.project?._id) return;
    
    try {
      const response = await axios.get(`/api/projects/${task.project._id}/members`);
      if (response.data.success) {
        setTeamMembers(response.data.members || []);
      }
    } catch (error) {
      console.error('Fetch team members error:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(`/api/tasks/${task._id}/comments`, {
        content: newComment
      });
      
      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setNewComment('');
        toast.success('Comment added');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (userId) => {
    try {
      const response = await axios.put(`/api/tasks/${task._id}/assign`, {
        assignedTo: userId
      });
      
      if (response.data.success) {
        toast.success('Task assigned successfully');
        onTaskUpdate(response.data.task);
      }
    } catch (error) {
      toast.error('Failed to assign task');
    }
  };

  const handleUnassignTask = async () => {
    try {
      const response = await axios.put(`/api/tasks/${task._id}/assign`, {
        assignedTo: null
      });
      
      if (response.data.success) {
        toast.success('Task unassigned');
        onTaskUpdate(response.data.task);
      }
    } catch (error) {
      toast.error('Failed to unassign task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <p className="text-sm text-gray-600 mt-1">Task Collaboration</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              <FaTimes />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === 'comments'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaComments />
              <span>Comments ({comments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === 'assignment'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaUsers />
              <span>Assignment</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex space-x-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaPaperPlane />
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComments className="mx-auto text-gray-400 text-3xl mb-3" />
                    <p className="text-gray-500">No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{comment.author?.username || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 ml-11">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignment' && (
            <div className="space-y-6">
              {/* Current Assignment */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Current Assignment</h3>
                {task.assignedTo ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                        {task.assignedTo.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{task.assignedTo.username}</div>
                        <div className="text-sm text-gray-500">{task.assignedTo.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleUnassignTask}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                    >
                      Unassign
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaUsers className="mx-auto text-gray-400 text-2xl mb-2" />
                    <p className="text-gray-500">No one assigned to this task</p>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Assign to Team Member</h3>
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers className="mx-auto text-gray-400 text-3xl mb-3" />
                    <p className="text-gray-500">No team members found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add members to the project to assign tasks
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{member.username}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.assignedTo?._id === member._id ? (
                            <span className="flex items-center space-x-1 text-green-600 text-sm">
                              <FaUserCheck />
                              <span>Assigned</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAssignTask(member._id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Task Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium capitalize">
                      {task.status?.replace('-', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <span className="ml-2 font-medium capitalize">{task.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Project:</span>
                    <span className="ml-2 font-medium">{task.project?.title || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCollaboration;
