import React from 'react';
import { Play, Heart, ShoppingCart, TrendingUp } from 'lucide-react';
import './MusicCard.css';

const MusicCard = ({ track, onPlay, onPurchase }) => {
  return (
    <div className="music-card hover-lift">
      <div className="album-art-wrapper">
        <img
          src={track.albumArt}
          alt={track.title}
          className="album-art"
        />
        <button className="play-overlay" onClick={() => onPlay(track)}>
          <Play size={32} fill="white" />
        </button>
        <div className="track-price">${track.price}</div>
      </div>
      <div className="music-info">
        <h3 className="track-title">{track.title}</h3>
        <p className="artist-name">{track.artist}</p>
        <div className="track-stats">
          <span className="stat-item">
            <TrendingUp size={14} />
            {track.plays}
          </span>
          <span className="stat-separator">•</span>
          <span className="stat-item">
            <Heart size={14} />
            {track.likes}
          </span>
        </div>
        <div className="track-actions">
          <button className="action-btn like-btn">
            <Heart size={16} />
          </button>
          <button className="action-btn purchase-btn" onClick={() => onPurchase(track)}>
            <ShoppingCart size={16} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
