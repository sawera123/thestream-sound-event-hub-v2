import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';
import './MusicPlayer.css';

const MusicPlayer = ({ currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(33);
  const [volume, setVolume] = useState(75);

  if (!currentTrack) return null;

  return (
    <div className="music-player">
      <div className="player-content">
        {/* Track Info */}
        <div className="player-track-info">
          <img
            src={currentTrack.albumArt}
            alt={currentTrack.title}
            className="player-album-art"
          />
          <div className="player-text-info">
            <h4 className="player-title">{currentTrack.title}</h4>
            <p className="player-artist">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="player-controls">
          <div className="control-buttons">
            <button className="control-btn">
              <Shuffle size={18} />
            </button>
            <button className="control-btn">
              <SkipBack size={20} />
            </button>
            <button
              className="control-btn play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>
            <button className="control-btn">
              <SkipForward size={20} />
            </button>
            <button className="control-btn">
              <Repeat size={18} />
            </button>
          </div>
          <div className="progress-bar-wrapper">
            <span className="progress-time">1:23</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                <div className="progress-thumb"></div>
              </div>
            </div>
            <span className="progress-time">{currentTrack.duration}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="player-volume">
          <Volume2 size={20} />
          <div className="volume-slider">
            <div className="volume-fill" style={{ width: `${volume}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
