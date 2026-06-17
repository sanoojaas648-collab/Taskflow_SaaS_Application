import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const workspace = JSON.parse(localStorage.getItem('currentWorkspace') || 'null');

  const fetchProjects = async () => {
    if (!workspace) return;
    try {
      const { data } = await API.get(`/projects?workspaceId=${workspace._id}`);
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [workspace]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', { ...form, workspaceId: workspace._id });
      setForm({ title: '', description: '' });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (!workspace) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Please select a workspace first.</p>
        <Link to="/workspace" className="text-primary-600 hover:underline mt-2 inline-block">
          Go to Workspaces
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your workspace projects</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + New Project
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No projects yet. Create your first project!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Link to={`/projects/${project._id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                  {project.title}
                </Link>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center justify-between">
                <Link
                  to={`/projects/${project._id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Details →
                </Link>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="Website Development"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Project description..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
