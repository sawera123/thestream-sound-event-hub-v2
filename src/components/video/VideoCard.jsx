import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, Circle } from 'lucide-react';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="video-card hover-lift" 
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <div className="video-thumbnail-wrapper">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="video-thumbnail"
        />
        <div className="video-duration">
          {video.isLive ? (
            <span className="live-badge">
              <Circle className="live-dot" size={8} fill="currentColor" />
              LIVE
            </span>
          ) : (
            <span className="duration-badge">
              <Clock size={12} />
              {video.duration}
            </span>
          )}
        </div>
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-channel">{video.channel}</p>
        <div className="video-meta">
          <span className="meta-item">
            <Eye size={14} />
            {video.views} views
          </span>
          <span className="meta-separator">•</span>
          <span className="meta-item">{video.uploadedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
