import React from 'react';
import { Home, TrendingUp, Music, Gamepad, Radio, Clock, ThumbsUp, Film } from 'lucide-react';
import './VideoSidebar.css';

const VideoSidebar = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', icon: Home, label: 'Home' },
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'gaming', icon: Gamepad, label: 'Gaming' },
    { id: 'live', icon: Radio, label: 'Live' },
    { id: 'movies', icon: Film, label: 'Movies' },
    { id: 'watchlater', icon: Clock, label: 'Watch Later' },
    { id: 'liked', icon: ThumbsUp, label: 'Liked Videos' },
  ];

  return (
    <aside className="video-sidebar">
      <div className="sidebar-content">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`sidebar-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <category.icon size={20} />
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default VideoSidebar;
