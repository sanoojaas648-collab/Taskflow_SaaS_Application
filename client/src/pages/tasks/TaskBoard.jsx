import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import TaskCard from '../../components/TaskCard';

const columns = [
  { id: 'todo', label: 'To Do', color: 'border-gray-300 bg-gray-50' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-400 bg-blue-50' },
  { id: 'completed', label: 'Completed', color: 'border-green-400 bg-green-50' },
];

const TaskBoard = () => {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('projectId');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectIdParam || '');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const workspace = JSON.parse(localStorage.getItem('currentWorkspace') || 'null');

  useEffect(() => {
    if (!workspace) return;
    const fetchProjects = async () => {
      const { data } = await API.get(`/projects?workspaceId=${workspace._id}`);
      setProjects(data);
      if (!selectedProject && data.length > 0) {
        setSelectedProject(data[0]._id);
      }
      setLoading(false);
    };
    fetchProjects();
  }, [workspace]);

  useEffect(() => {
    if (!selectedProject) return;
    const fetchTasks = async () => {
      const { data } = await API.get(`/tasks?projectId=${selectedProject}`);
      setTasks(data);
    };
    fetchTasks();
  }, [selectedProject]);

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      await API.put(`/tasks/${taskId}`, { status });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/tasks', { ...form, projectId: selectedProject });
      setTasks((prev) => [...prev, data]);
      setForm({ title: '', description: '', priority: 'medium' });
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
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
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="text-gray-500 mt-1">Kanban-style task management</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
          {selectedProject && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              + Add Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !selectedProject ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Select a project to view tasks</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.id);
            return (
              <div
                key={column.id}
                className={`rounded-xl border-t-4 p-4 min-h-[400px] ${column.color}`}
                onDrop={(e) => handleDrop(e, column.id)}
                onDragOver={handleDragOver}
              >
                <h3 className="font-semibold text-gray-700 mb-4">
                  {column.label} ({columnTasks.length})
                </h3>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      canAssign
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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

export default TaskBoard;
