import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Video, Music, Calendar, Menu, X, Search, Bell, User, Zap, LogOut } from 'lucide-react';
import './Navigation.css';
import { supabase } from '../lib/supabase';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState({ name: 'Guest', email: '' });
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Profile fetch karo
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();

        const userName = profile?.full_name || session.user.email?.split('@')[0] || 'User';
        const userEmail = session.user.email || '';

        setUser({ name: userName, email: userEmail });
        setIsAdmin((profile?.role === 'admin') || session.user.email === 'admin@example.com');
      } else {
        setUser({ name: 'Guest', email: '' });
        setIsAdmin(false);
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkUser();
      } else if (event === 'SIGNED_OUT') {
        setUser({ name: 'Guest', email: '' });
        setIsAdmin(false);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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
        <Link to="/" className="nav-logo">
          <div className="logo-icon"><Video className="logo-video" /></div>
          <span className="logo-text">StreamHub</span>
        </Link>

        <div className="nav-search">
          <input type="text" placeholder="Search videos, music, events..." className="search-input" />
          <button className="search-btn"><Search size={20} /></button>
        </div>

        <div className="nav-links">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link ${isActive(item.path) ? 'active' : ''}`}>
              <item.icon size={20} /><span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <Link to="/subscription" className="upgrade-btn"><Zap size={18} fill="currentColor" /><span>Upgrade</span></Link>
          <button className="nav-action-btn"><Bell size={20} /></button>

          <div className="user-menu-wrapper">
            <button className="nav-action-btn user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
              <User size={20} />
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </div>

                {isAdmin && (
                  <Link to="/admin" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                    <Zap size={16} /> <span>Admin Panel</span>
                  </Link>
                )}

                {user.email && (
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <LogOut size={16} /> <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
              <item.icon size={20} /> <span>{item.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
              <Zap size={20} /> <span>Admin Panel</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;