import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Video, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import './Signup.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms and Privacy Policy');
      return;
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = existingUsers.find(u => u.email === email);

    if (userExists) {
      setError('An account with this email already exists');
      return;
    }

    // Create new user
    const newUser = {
      name,
      email,
      password,
      isAdmin: false,
      registeredAt: new Date().toISOString()
    };

    // Save to registered users
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    // Auto login
    const user = {
      email: newUser.email,
      name: newUser.name,
      isAdmin: false,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(user));

    // Redirect to home
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          {/* Logo Section */}
          <div className="signup-logo">
            <div className="logo-icon-large">
              <Video className="logo-video-large" />
            </div>
            <h1 className="logo-text-large">Join StreamHub</h1>
            <p className="logo-subtitle">Create your account and start sharing today.</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="signup-form">
            {error && (
              <div className="error-message">
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">
                <User size={18} />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

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
                  placeholder="Create a password (min 6 characters)"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={18} />
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the <Link to="/privacy">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </span>
            </label>

            <button type="submit" className="signup-btn">
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="login-link">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>

          {/* Privacy Link */}
          <div className="privacy-link">
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>

        {/* Right Side Illustration */}
        <div className="signup-illustration">
          <div className="illustration-content">
            <h2>Welcome Aboard!</h2>
            <p>✓ Upload unlimited content</p>
            <p>✓ Build your audience</p>
            <p>✓ Monetize your creativity</p>
            <p>✓ Join millions of creators</p>
            <div className="illustration-gradient"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
