import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const TaskModal = ({ isOpen, onClose, onSuccess, task = null, projects = [] }) => {
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        project: task.project?._id || "",
        assignedTo: task.assignedTo?._id || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        project: "",
        assignedTo: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
      });
    }
  }, [task]);

  useEffect(() => {
    if (formData.project && isAuthenticated) {
      fetchProjectMembers(formData.project);
    } else {
      setProjectMembers([]);
      setFormData((prev) => ({ ...prev, assignedTo: "" }));
    }
  }, [formData.project, isAuthenticated]);

  const fetchProjectMembers = async (projectId) => {
    try {
      setLoadingMembers(true);
      const response = await axios.get(`/projects/${projectId}/members`);
      if (response.data.success) {
        setProjectMembers(response.data.members || []);
      }
    } catch (error) {
      console.error("Error fetching project members:", error);
      setProjectMembers([]);
      if (error.response?.status !== 404) {
        toast.error("Failed to load project members");
      }
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.project || !formData.dueDate) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);

      const dueDate = new Date(formData.dueDate + 'T00:00:00.000Z');

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: formData.project,
        assignedTo: formData.assignedTo || null,
        status: formData.status,
        priority: formData.priority,
        dueDate: dueDate.toISOString(),
      };

      let response;
      if (task) {
        response = await axios.put(`/tasks/${task._id}`, taskData);
      } else {
        response = await axios.post("/tasks", taskData);
      }

      if (response.data.success) {
        toast.success(task ? "Task updated successfully" : "Task created successfully");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Submit error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save task";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">{task ? "Edit Task" : "Create Task"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✖</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full border border-gray-300 p-2 rounded-md resize-none"
              placeholder="Enter task description"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
            <select
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.title}</option>
              ))}
            </select>
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To {loadingMembers && <span className="text-xs text-gray-500 ml-2">(Loading...)</span>}
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              disabled={!formData.project || loadingMembers}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.username} ({member.email}) - {member.role}
                </option>
              ))}
            </select>
            {!formData.project && (
              <p className="text-xs text-gray-500 mt-1">Select a project first to see available members</p>
            )}
            {formData.project && projectMembers.length === 0 && !loadingMembers && (
              <p className="text-xs text-yellow-600 mt-1">No team members found for this project</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full border border-gray-300 p-2 rounded-md"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {task ? "Updating..." : "Creating..."}
                </span>
              ) : (
                task ? "Update Task" : "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
