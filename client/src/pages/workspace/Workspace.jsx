import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import API from '../../api/axios';
import { setCurrentWorkspace } from '../../store/authSlice';

const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedWs, setSelectedWs] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    try {
      const { data } = await API.get('/workspaces');
      setWorkspaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/workspaces', form);
      setForm({ name: '' });
      setShowModal(false);
      selectWorkspace(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create workspace');
    }
  };

  const selectWorkspace = (workspace) => {
    dispatch(setCurrentWorkspace(workspace));
    navigate('/dashboard');
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/workspaces/${selectedWs._id}/invite`, inviteForm);
      setInviteForm({ email: '', role: 'member' });
      setShowInviteModal(false);
      fetchWorkspaces();
      alert('Member invited successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to invite member');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this workspace and all its data?')) return;
    try {
      await API.delete(`/workspaces/${id}`);
      localStorage.removeItem('currentWorkspace');
      fetchWorkspaces();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete workspace');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">TF</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Workspaces</h1>
          <p className="text-gray-500 mt-2">Select or create a workspace to get started</p>
        </div>

        <div className="flex justify-end mb-6">
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Create Workspace
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading workspaces...</p>
        ) : workspaces.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No workspaces yet. Create your first one!</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((ws) => (
              <div key={ws._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ws.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {ws.members?.length || 0} members
                    </p>
                  </div>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                    {ws.members?.find((m) => m.userId?._id === ws.owner?._id || m.userId === ws.owner)?.role || 'member'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => selectWorkspace(ws)} className="btn-primary text-sm flex-1">
                    Open
                  </button>
                  <button
                    onClick={() => { setSelectedWs(ws); setShowInviteModal(true); }}
                    className="btn-secondary text-sm"
                  >
                    Invite
                  </button>
                  <button
                    onClick={() => handleDelete(ws._id)}
                    className="text-sm text-red-500 hover:text-red-700 px-3 py-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Workspace</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                  className="input-field"
                  placeholder="My Startup"
                  required
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

      {showInviteModal && selectedWs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Invite to {selectedWs.name}</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="input-field"
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="input-field"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
