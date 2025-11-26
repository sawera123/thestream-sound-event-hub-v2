import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
} from "lucide-react";
import "./MusicPlayer.css";

const MusicPlayer = ({ currentTrack }) => {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);

  // Load new track & auto-play
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      console.log("🎵 Loading:", currentTrack.audioUrl);

      audioRef.current.load();

      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Auto-play Blocked:", err));
    }
  }, [currentTrack]);

  // Update progress & time
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    
    if (!audio) return;

    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);

    const percent = (audio.currentTime / audio.duration) * 100;
    setProgress(percent || 0);
  };

  // Seek / scrub
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;

    audio.currentTime = pos * duration;
  };

  // Play / pause toggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true));
    }
  };

  // Volume control (FIXED!)
  const handleVolume = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const vol = Math.min(1, Math.max(0, pos));

    setVolume(vol * 100);

    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Apply volume initially
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, []);

  if (!currentTrack) return null;

  return (
    <div className="music-player">
      {console.log("🎧 Player audio URL:", currentTrack.audioUrl)}
      {/* REAL AUDIO ELEMENT */}
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate}>
        <source src={currentTrack.audioUrl} />
      </audio>

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

            <button className="control-btn play-btn" onClick={togglePlay}>
              {isPlaying ? (
                <Pause size={24} fill="white" />
              ) : (
                <Play size={24} fill="white" />
              )}
            </button>

            <button className="control-btn">
              <SkipForward size={20} />
            </button>

            <button className="control-btn">
              <Repeat size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-wrapper">
            <span className="progress-time">
              {Math.floor(currentTime)}s
            </span>

            <div className="progress-bar" onClick={handleSeek}>
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              >
                <div className="progress-thumb"></div>
              </div>
            </div>

            <span className="progress-time">{Math.floor(duration)}s</span>
          </div>
        </div>

        {/* Volume */}
        <div className="player-volume">
          <Volume2 size={20} />
          <div className="volume-slider" onClick={handleVolume}>
            <div
              className="volume-fill"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
