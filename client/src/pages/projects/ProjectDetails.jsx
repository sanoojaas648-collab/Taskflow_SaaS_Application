import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../api/axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assignedTo: '' });
  const [members, setMembers] = useState([]);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?projectId=${id}`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);

      const workspace = JSON.parse(localStorage.getItem('currentWorkspace') || 'null');
      if (workspace) {
        const wsRes = await API.get(`/workspaces/${workspace._id}`);
        setMembers(wsRes.data.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', {
        ...form,
        projectId: id,
        assignedTo: form.assignedTo || null,
      });
      setForm({ title: '', description: '', priority: 'medium', assignedTo: '' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!project) return <div className="p-8 text-gray-500">Project not found</div>;

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-500 mt-1">{project.description || 'No description'}</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/tasks?projectId=${id}`} className="btn-secondary">
              Open Task Board
            </Link>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{project.taskCount || 0}</p>
          <p className="text-sm text-gray-500">Total Tasks</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{project.completedCount || 0}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {(project.taskCount || 0) - (project.completedCount || 0)}
          </p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'To Do', tasks: todoTasks, color: 'border-gray-300' },
          { label: 'In Progress', tasks: inProgressTasks, color: 'border-blue-400' },
          { label: 'Completed', tasks: completedTasks, color: 'border-green-400' },
        ].map((column) => (
          <div key={column.label} className={`border-t-4 ${column.color} bg-gray-50 rounded-lg p-4`}>
            <h3 className="font-semibold text-gray-700 mb-3">
              {column.label} ({column.tasks.length})
            </h3>
            <div className="space-y-2">
              {column.tasks.map((task) => (
                <div key={task._id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.assignedTo && (
                    <p className="text-xs text-gray-500 mt-1">{task.assignedTo.name}</p>
                  )}
                </div>
              ))}
              {column.tasks.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="input-field"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId._id} value={m.userId._id}>
                      {m.userId.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
