import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const statCards = [
  { key: 'totalProjects', label: 'Total Projects', icon: '📁', color: 'bg-blue-50 text-blue-700' },
  { key: 'completedTasks', label: 'Completed Tasks', icon: '✅', color: 'bg-green-50 text-green-700' },
  { key: 'pendingTasks', label: 'Pending Tasks', icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
  { key: 'teamMembers', label: 'Team Members', icon: '👥', color: 'bg-purple-50 text-purple-700' },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const workspace = JSON.parse(localStorage.getItem('currentWorkspace') || 'null');

  useEffect(() => {
    if (!workspace) return;
    const fetchDashboard = async () => {
      try {
        const { data } = await API.get(`/workspaces/${workspace._id}/dashboard`);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [workspace]);

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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of {workspace.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.[card.key] ?? 0}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((task) => (
                <div key={task._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      {task.projectId?.title} · {task.status.replace('_', ' ')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          {stats?.projects?.length > 0 ? (
            <div className="space-y-3">
              {stats.projects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <p className="font-medium text-gray-900">{project.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{project.description || 'No description'}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No projects yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
