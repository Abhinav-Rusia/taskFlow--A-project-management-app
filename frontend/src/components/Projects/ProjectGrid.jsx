import ProjectCard from './ProjectCard';

const ProjectGrid = ({ 
  projects, 
  onEdit, 
  onDelete, 
  onTeamManagement, 
  onCreateProject,
  formatToDDMMYY 
}) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          📁
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
        <p className="text-gray-500 mb-6">Get started by creating your first project</p>
        <button 
          onClick={onCreateProject} 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Your First Project
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onTeamManagement={onTeamManagement}
          formatToDDMMYY={formatToDDMMYY}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
