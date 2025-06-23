import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import UserSearch from '../team/UserSearch';

const ProjectModal = ({
  isOpen,
  onClose,
  onSuccess,
  edit = false,
  project = null,
  formatToDDMMYY,
  formatToYYYYMMDD
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'low',
    startDate: '',
    dueDate: '',
    teamMembers: []
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (edit && project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'pending',
        priority: project.priority || 'low',
        startDate: project.startDate ? formatToDDMMYY(project.startDate) : '',
        dueDate: project.dueDate ? formatToDDMMYY(project.dueDate) : '',
        teamMembers: project.teamMembers?.map(member => member._id) || []
      });
      setSelectedMembers(project.teamMembers || []);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'low',
        startDate: '',
        dueDate: '',
        teamMembers: []
      });
      setSelectedMembers([]);
    }
  }, [edit, project, formatToDDMMYY]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMemberSelect = (user) => {
    if (!selectedMembers.find(member => member._id === user._id)) {
      const newSelectedMembers = [...selectedMembers, user];
      setSelectedMembers(newSelectedMembers);
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, user._id]
      });
    }
  };

  const removeMember = (userId) => {
    const newSelectedMembers = selectedMembers.filter(member => member._id !== userId);
    setSelectedMembers(newSelectedMembers);
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter(id => id !== userId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Project title is required');
    if (!formData.description.trim()) return toast.error('Project description is required');
    if (!formData.startDate) return toast.error('Start date is required');
    if (!formData.dueDate) return toast.error('Due date is required');

    const payload = {
      ...formData,
      startDate: formatToYYYYMMDD(formData.startDate),
      dueDate: formatToYYYYMMDD(formData.dueDate)
    };

    try {
      setLoading(true);
      const res = edit && project
        ? await axios.put(`/projects/${project._id}`, payload)
        : await axios.post('/projects', payload);
      if (res.data.success) {
        toast.success(edit ? 'Project updated successfully' : 'Project created successfully');
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {edit ? 'Edit Project' : 'Create New Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date (DD/MM/YY) *
              </label>
              <input
                type="text"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 12/06/25"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date (DD/MM/YY) *
              </label>
              <input
                type="text"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 30/06/25"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Members
            </label>
            
            {selectedMembers.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <div key={member._id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                    <span>{member.username}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member._id)}
                      className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <UserSearch
              onUserSelect={handleMemberSelect}
              excludeUsers={selectedMembers.map(member => member._id)}
              placeholder="Search users to add to team..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : edit ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
