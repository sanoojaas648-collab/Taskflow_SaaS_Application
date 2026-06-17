import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const workspace = JSON.parse(localStorage.getItem('currentWorkspace') || 'null');

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <span className="font-semibold text-lg text-gray-900">TaskFlow</span>
        </Link>
        {workspace && (
          <span className="text-sm text-gray-500 border-l pl-4 border-gray-300">
            {workspace.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-medium text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
