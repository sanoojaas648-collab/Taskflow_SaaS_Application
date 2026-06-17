import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/tasks', label: 'Task Board', icon: '✅' },
  { to: '/workspace', label: 'Workspace', icon: '🏢' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
