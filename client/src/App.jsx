import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Projects';
import ProjectDetails from './pages/projects/ProjectDetails';
import TaskBoard from './pages/tasks/TaskBoard';
import Workspace from './pages/workspace/Workspace';

const PublicRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  if (token) {
    return <Navigate to="/workspace" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/workspace/settings" element={<Workspace />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
