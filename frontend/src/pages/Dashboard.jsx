import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  ArrowRightIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // const fetchDashboardData = async () => {
  //   try {
  //     setLoading(true);
  //     const [projectsResponse, tasksResponse] = await Promise.all([
  //       axios.get('/projects'),
  //       axios.get('/tasks/my-tasks')
  //     ]);

  //     if (projectsResponse.data.success) {
  //       const projects = projectsResponse.data.projects || projectsResponse.data.data || [];
  //       setRecentProjects(projects.slice(0, 3));
  //       const totalProjects = projects.length;
  //       setStats(prev => ({ ...prev, totalProjects }));
  //     }

  //     if (tasksResponse.data.success) {
  //       const tasks = tasksResponse.data.tasks || tasksResponse.data.data || [];
  //       setRecentTasks(tasks.slice(0, 3));
  //       const activeTasks = tasks.filter(task => task.status === 'todo' || task.status === 'in-progress').length;
  //       const completedTasks = tasks.filter(task => task.status === 'completed').length;
  //       const overdueTasks = tasks.filter(task =>
  //         new Date(task.dueDate) < new Date() && task.status !== 'completed'
  //       ).length;
  //       setStats(prev => ({
  //         ...prev,
  //         activeTasks,
  //         completedTasks,
  //         overdueTasks
  //       }));
  //     }
  //   } catch (error) {
  //     console.error('Dashboard data fetch error:', error);
  //     toast.error('Failed to load dashboard data');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [projectsResponse, tasksResponse] = await Promise.all([
        axios.get("/projects"),
        axios.get("/tasks/my-tasks"),
      ]);

      // Process projects data
      if (projectsResponse.data.success) {
        const projects =
          projectsResponse.data.projects || projectsResponse.data.data || [];
        setRecentProjects(projects.slice(0, 3));

        const totalProjects = projects.length;
        setStats((prev) => ({ ...prev, totalProjects }));
      }

      // Process tasks data
      if (tasksResponse.data.success) {
        const tasks = tasksResponse.data.tasks || [];

        setRecentTasks(tasks.slice(0, 3));

        // Calculate task stats
        const activeTasks = tasks.filter(
          (task) => task.status === "todo" || task.status === "in-progress"
        ).length;

        const completedTasks = tasks.filter(
          (task) => task.status === "completed"
        ).length;

        const overdueTasks = tasks.filter(
          (task) =>
            new Date(task.dueDate) < new Date() && task.status !== "completed"
        ).length;

        setStats((prev) => ({
          ...prev,
          activeTasks,
          completedTasks,
          overdueTasks,
        }));
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "in-progress":
        return "text-blue-600 bg-blue-50";
      case "todo":
        return "text-gray-600 bg-gray-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const calculateProjectProgress = (project) => {
    return Math.floor(Math.random() * 100); // Replace with real logic if available
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-slate-800">
                TaskFlow
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {getGreeting()}, {user?.firstName}! 👋
          </h1>
          <p className="text-slate-600">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            count={stats.totalProjects}
            icon={<FolderIcon className="w-6 h-6 text-blue-600" />}
            bg="bg-blue-100"
          />
          <StatCard
            title="Active Tasks"
            count={stats.activeTasks}
            icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
            bg="bg-yellow-100"
          />
          <StatCard
            title="Completed"
            count={stats.completedTasks}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
            bg="bg-green-100"
          />
          <StatCard
            title="Overdue"
            count={stats.overdueTasks}
            icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
            bg="bg-red-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <QuickLink
            to="/projects"
            label="New Project"
            icon={<PlusIcon className="w-5 h-5 mr-2" />}
            primary
          />
          <QuickLink
            to="/tasks"
            label="New Task"
            icon={<PlusIcon className="w-5 h-5 mr-2" />}
          />
          <QuickLink
            to="/analytics"
            label="View Analytics"
            icon={<ChartBarIcon className="w-5 h-5 mr-2" />}
          />
        </div>

        {/* Recent Projects & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentList
            title="Recent Projects"
            items={recentProjects}
            to="/projects"
            type="project"
            getColor={getStatusColor}
            getProgress={calculateProjectProgress}
          />
          <RecentList
            title="Recent Tasks"
            items={recentTasks}
            to="/tasks"
            type="task"
            getColor={getStatusColor}
          />
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, count, icon, bg }) => (
  <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{count}</p>
      </div>
      <div
        className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const QuickLink = ({ to, label, icon, primary }) => (
  <Link
    to={to}
    className={`inline-flex items-center px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg ${
      primary
        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
        : "bg-white/70 text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    {icon}
    {label}
  </Link>
);

const RecentList = ({ title, items, to, type, getColor, getProgress }) => (
  <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-xl">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <Link
        to={to}
        className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center"
      >
        View all <ArrowRightIcon className="w-4 h-4 ml-1" />
      </Link>
    </div>
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item._id}
            className="p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-100/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${
                    item.priority === "high"
                      ? "bg-red-500"
                      : item.priority === "medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                ></div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
            </div>
            {type === "project" && (
              <>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{getProgress(item)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full"
                      style={{ width: `${getProgress(item)}%` }}
                    ></div>
                  </div>
                </div>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-xl ${getColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </>
            )}
            {type === "task" && (
              <div className="flex justify-between items-center text-sm">
                <span
                  className={`inline-block px-2 py-1 font-semibold rounded-xl ${getColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
                <span className="text-slate-500">
                  {new Date(item.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-slate-500 text-sm">No {type}s found.</p>
      )}
    </div>
  </div>
);

export default Dashboard;
