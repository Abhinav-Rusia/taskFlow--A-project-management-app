import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import TaskCard from "../components/tasks/TaskCard";
import TaskModal from "../components/tasks/TaskModal";
import TaskList from "../components/tasks/TaskList";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskCollaboration from "../components/tasks/TaskCollaboration";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/tasks/my");
      if (response.data.success) {
        const taskData = response.data.tasks || response.data.data || [];
        setTasks(taskData);
        setFilteredTasks(taskData);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/projects");
      if (response.data.success) {
        setProjects(response.data.projects || response.data.data || []);
      }
    } catch (error) {
      console.error("Fetch projects error:", error);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...tasks];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Project filter
    if (filters.project) {
      filtered = filtered.filter(task => task.project?._id === filters.project);
    }

    // Due date filter
    if (filters.dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(task => {
        const dueDate = new Date(task.dueDate);
        switch (filters.dueDate) {
          case 'overdue':
            return dueDate < today && task.status !== 'completed';
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'week':
            return dueDate >= today && dueDate <= weekFromNow;
          case 'month':
            return dueDate >= today && dueDate <= monthFromNow;
          default:
            return true;
        }
      });
    }

    setFilteredTasks(filtered);
  };

  const handleDeleteTask = async (taskId) => {
  if (window.confirm('Are you sure you want to delete this task?')) {
    try {
      const response = await axios.delete(`/tasks/${taskId}`);
      
      if (response.data.success) {
        toast.success('Task deleted successfully');
        fetchTasks(); 
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      toast.error(errorMessage);
    }
  }
};


  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCollaborateTask = (task) => {
    setSelectedTask(task);
    setShowCollaboration(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setSelectedTask(null);
    fetchTasks();
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
    setFilteredTasks(filteredTasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage your tasks and track progress</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Filters */}
        <TaskFilters 
          onFilterChange={handleFilterChange}
          projects={projects}
        />

        {/* Tasks List */}
        <TaskList
          tasks={filteredTasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onCollaborate={handleCollaborateTask}
          loading={loading}
        />
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
        }}
        onSuccess={handleModalSuccess}
        task={selectedTask}
        projects={projects}
      />

      <TaskCollaboration
        task={selectedTask}
        isOpen={showCollaboration}
        onClose={() => {
          setShowCollaboration(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};

export default Tasks;
