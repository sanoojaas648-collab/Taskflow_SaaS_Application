import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const { token } = useSelector((state) => state.auth);
  const workspace = localStorage.getItem('currentWorkspace');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!workspace) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
