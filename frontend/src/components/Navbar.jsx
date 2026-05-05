import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/projects', label: 'Projects', icon: <FolderKanban size={20} /> },
  ];

  return (
    <nav className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-glow"></div>
        <h2>TeamTask</h2>
      </div>

      <div className="user-profile">
        <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role status-badge status-todo">{user?.role}</span>
        </div>
      </div>

      <ul className="nav-links">
        {navLinks.map((link) => (
          <li key={link.path}>
            <Link 
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <button className="btn btn-secondary logout-btn" onClick={logout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default Navbar;
