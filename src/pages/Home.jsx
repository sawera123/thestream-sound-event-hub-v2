import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Music, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: Video,
      title: 'Video Streaming',
      description: 'Watch and stream your favorite content in HD quality',
      link: '/videos',
      gradient: 'from-primary to-primary-glow'
    },
    {
      icon: Music,
      title: 'Music Marketplace',
      description: 'Discover and purchase exclusive tracks from top artists',
      link: '/music',
      gradient: 'from-accent to-primary'
    },
    {
      icon: Calendar,
      title: 'Event Tickets',
      description: 'Book tickets for the hottest events and concerts',
      link: '/events',
      gradient: 'from-primary-glow to-accent'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-slide-in">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Premium Entertainment Platform</span>
          </div>
          <h1 className="hero-title">
            Experience Entertainment
            <span className="text-gradient"> Like Never Before</span>
          </h1>
          <p className="hero-description">
            Stream videos, discover music, and book event tickets all in one place.
            Join millions of users enjoying premium content.
          </p>
          <div className="hero-actions">
            <Link to="/videos" className="hero-btn primary">
              <Video size={20} />
              Start Watching
            </Link>
            <Link to="/music" className="hero-btn secondary">
              <Music size={20} />
              Explore Music
            </Link>
          </div>
        </div>
        <div className="hero-visual animate-float">
          <div className="visual-orb orb-1"></div>
          <div className="visual-orb orb-2"></div>
          <div className="visual-orb orb-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <TrendingUp className="section-icon" />
          <h2 className="section-title">Explore Our Platforms</h2>
          <p className="section-subtitle">Everything you need for entertainment in one place</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="feature-card hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon-wrapper">
                <feature.icon size={32} className="feature-icon" />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-arrow">→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item animate-scale-in">
            <div className="stat-number">10M+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="stat-number">500K+</div>
            <div className="stat-label">Content Creators</div>
          </div>
          <div className="stat-item animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-number">1M+</div>
            <div className="stat-label">Premium Tracks</div>
          </div>
          <div className="stat-item animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="stat-number">50K+</div>
            <div className="stat-label">Live Events</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
