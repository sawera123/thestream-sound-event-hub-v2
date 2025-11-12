import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Video, Music, Calendar, Menu, X, Search, Bell, User, Zap, LogOut } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/videos', icon: Video, label: 'Videos' },
    { path: '/music', icon: Music, label: 'Music' },
    { path: '/events', icon: Calendar, label: 'Events' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">
            <Video className="logo-video" />
          </div>
          <span className="logo-text">StreamHub</span>
        </Link>

        {/* Search Bar */}
        <div className="nav-search">
          <input
            type="text"
            placeholder="Search videos, music, events..."
            className="search-input"
          />
          <button className="search-btn">
            <Search size={20} />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          <Link to="/subscription" className="upgrade-btn">
            <Zap size={18} fill="currentColor" />
            <span>Upgrade</span>
          </Link>
          <button className="nav-action-btn">
            <Bell size={20} />
          </button>
          <div className="user-menu-wrapper">
            <button 
              className="nav-action-btn user-btn" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User size={20} />
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <p className="user-name">{user?.name || 'User'}</p>
                  <p className="user-email">{user?.email || ''}</p>
                </div>
                {user?.isAdmin && (
                  <Link to="/admin" className="dropdown-item admin-link">
                    <Zap size={16} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-menu-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
