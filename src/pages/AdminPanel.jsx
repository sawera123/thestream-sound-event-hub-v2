import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Video, Flag, Settings, 
  LogOut, Search, Ban, RotateCcw, CheckCircle, XCircle,
  TrendingUp, UserCheck, Upload, AlertTriangle
} from 'lucide-react';
import { usersData, reportedVideos, refundRequests } from '../data/usersData';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState(usersData);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Active' ? 'Banned' : 'Active' }
        : user
    ));
  };

  const resetUploads = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, uploads: 0 }
        : user
    ));
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    totalUploads: users.reduce((sum, u) => sum + u.uploads, 0),
    bannedUsers: users.filter(u => u.status === 'Banned').length
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Video className="logo-icon" />
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <Flag size={20} />
            <span>Reports</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'refunds' ? 'active' : ''}`}
            onClick={() => setActiveTab('refunds')}
          >
            <Settings size={20} />
            <span>Refunds</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <h1 className="admin-title">
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'reports' && 'Reported Videos'}
            {activeTab === 'refunds' && 'Refund Requests'}
          </h1>
          
          <div className="admin-actions">
            <div className="admin-user-info">
              <span className="admin-user-name">{user.name || 'Admin'}</span>
              <span className="admin-user-email">{user.email}</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content">
          {activeTab === 'users' && (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <Users size={24} />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Users</p>
                    <h3 className="stat-value">{stats.totalUsers}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <UserCheck size={24} />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Active Users</p>
                    <h3 className="stat-value">{stats.activeUsers}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                    <Upload size={24} />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Uploads</p>
                    <h3 className="stat-value">{stats.totalUploads}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Banned Users</p>
                    <h3 className="stat-value">{stats.bannedUsers}</h3>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="admin-search-bar">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Users Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Uploads</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {user.name.charAt(0)}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className="role-badge">{user.role}</span>
                        </td>
                        <td>
                          <span className="upload-count">{user.uploads}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.joinDate}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className={`action-btn ${user.status === 'Banned' ? 'unban' : 'ban'}`}
                              onClick={() => toggleUserStatus(user.id)}
                              title={user.status === 'Banned' ? 'Unban User' : 'Ban User'}
                            >
                              {user.status === 'Banned' ? <CheckCircle size={16} /> : <Ban size={16} />}
                            </button>
                            <button
                              className="action-btn reset"
                              onClick={() => resetUploads(user.id)}
                              title="Reset Uploads"
                            >
                              <RotateCcw size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Video Title</th>
                    <th>Reported By</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportedVideos.map(report => (
                    <tr key={report.id}>
                      <td>{report.videoTitle}</td>
                      <td>{report.reportedBy}</td>
                      <td>{report.reason}</td>
                      <td>{report.date}</td>
                      <td>
                        <span className={`status-badge ${report.status.toLowerCase().replace(' ', '-')}`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'refunds' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {refundRequests.map(refund => (
                    <tr key={refund.id}>
                      <td>{refund.userName}</td>
                      <td className="amount-cell">{refund.amount}</td>
                      <td>{refund.reason}</td>
                      <td>{refund.date}</td>
                      <td>
                        <span className={`status-badge ${refund.status.toLowerCase()}`}>
                          {refund.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
