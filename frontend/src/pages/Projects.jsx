import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProjectHeader from '../components/projects/ProjectHeader';
import ProjectGrid from '../components/projects/ProjectGrid';
import ProjectModal from '../components/projects/ProjectModal';
import TeamManagement from '../components/team/TeamManagement';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null); // Changed to null
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Date formatting functions
  const formatToDDMMYY = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatToYYYYMMDD = (ddmmyy) => {
    if (!ddmmyy) return '';
    const [day, month, year] = ddmmyy.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/projects');
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    setEditProject(null); // Set to null for new project
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setEditProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const res = await axios.delete(`/projects/${projectId}`);
      if (res.data.success) {
        toast.success('Project deleted successfully');
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleTeamManagement = (project) => {
    setSelectedProject(project);
    setShowTeamManagement(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditProject(null);
    fetchProjects();
  };

  const handleTeamUpdate = () => {
    fetchProjects();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showTeamManagement && selectedProject) {
    const isOwner = selectedProject.owner._id === user?.id;
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setShowTeamManagement(false)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Projects
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          </div>
          
          <TeamManagement
            project={selectedProject}
            isOwner={isOwner}
            onTeamUpdate={handleTeamUpdate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectHeader onCreateProject={handleCreateProject} />
      
      <ProjectGrid
        projects={projects}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        onTeamManagement={handleTeamManagement}
        onCreateProject={handleCreateProject}
        formatToDDMMYY={formatToDDMMYY}
      />

      {showModal && (
        <ProjectModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditProject(null);
          }}
          onSuccess={handleModalSuccess}
          edit={!!editProject} // Convert to boolean
          project={editProject} // This will be null for new projects
          formatToDDMMYY={formatToDDMMYY}
          formatToYYYYMMDD={formatToYYYYMMDD}
        />
      )}
    </div>
  );
};

export default Projects;
