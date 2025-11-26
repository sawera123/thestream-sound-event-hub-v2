import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Video, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import './Login.css';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

 // ... sab same, sirf handleLogin ka end change karo

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    setError(error.message);
    return;
  }

  // Profile fetch karo
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  // Agar admin hai toh /admin, warna home
  if (profile?.role === 'admin') {
    window.location.href = '/admin';   // ← Force full redirect (best for admin)
  } else {
    navigate('/');                     // Normal user ke liye
  }
};

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Logo Section */}
          <div className="login-logo">
            <div className="logo-icon-large">
              <Video className="logo-video-large" />
            </div>
            <h1 className="logo-text-large">StreamHub</h1>
            <p className="logo-subtitle">Welcome back! Please login to your account.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-btn">
              Login to StreamHub
            </button>

            <div className="admin-hint">
              <Zap size={16} />
              <span>Use admin@example.com to access Admin Panel</span>
            </div>
          </form>

          {/* Signup Link */}
          <div className="signup-link">
            <p>Don't have an account? <Link to="/signup">Sign up now</Link></p>
          </div>

          {/* Privacy Link */}
          <div className="privacy-link">
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>

        {/* Right Side Illustration */}
        <div className="login-illustration">
          <div className="illustration-content">
            <h2>Start Your Journey</h2>
            <p>Upload unlimited music and videos</p>
            <p>Connect with millions of creators</p>
            <p>Build your audience worldwide</p>
            <div className="illustration-gradient"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
