import React, { useState } from 'react';
import MusicCard from '../components/music/MusicCard';
import MusicPlayer from '../components/music/MusicPlayer';
import { musicData } from '../data/musicData';
import { Upload, Search, Filter } from 'lucide-react';
import './Music.css';

const Music = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const handlePlay = (track) => {
    setCurrentTrack(track);
  };

  const handlePurchase = (track) => {
    setSelectedTrack(track);
    setShowPurchaseModal(true);
  };

  return (
    <div className="music-page">
      <div className="music-header">
        <div>
          <h1 className="music-title">Music Marketplace</h1>
          <p className="music-subtitle">Discover exclusive tracks from top artists</p>
        </div>
        <div className="header-actions">
          <div className="search-wrapper">
            <Search size={18} />
            <input type="text" placeholder="Search music..." className="search-music" />
          </div>
          <button className="filter-btn">
            <Filter size={18} />
          </button>
          <button className="upload-music-btn" onClick={() => setShowUploadModal(true)}>
            <Upload size={18} />
            Upload Track
          </button>
        </div>
      </div>

      <div className="music-grid">
        {musicData.map((track) => (
          <MusicCard
            key={track.id}
            track={track}
            onPlay={handlePlay}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Upload Your Music</h2>
            <div className="upload-section">
              <div className="upload-box">
                <Upload size={40} className="upload-icon" />
                <p className="upload-title">Upload Audio File</p>
                <p className="upload-hint">MP3, WAV, FLAC (Max 50MB)</p>
                <input type="file" className="file-input" accept="audio/*" />
              </div>
              <div className="upload-box">
                <Upload size={40} className="upload-icon" />
                <p className="upload-title">Upload Album Art</p>
                <p className="upload-hint">JPG, PNG (Min 1000x1000px)</p>
                <input type="file" className="file-input" accept="image/*" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Track Title</label>
              <input type="text" className="form-input" placeholder="Enter track title" />
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <select className="form-select">
                <option>Electronic</option>
                <option>Hip Hop</option>
                <option>Rock</option>
                <option>Jazz</option>
                <option>Classical</option>
                <option>Pop</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price (USD)</label>
              <input type="number" className="form-input" placeholder="2.99" step="0.01" />
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button className="modal-btn submit">Publish Track</button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedTrack && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content purchase-modal" onClick={(e) => e.stopPropagation()}>
            <div className="purchase-header">
              <img src={selectedTrack.albumArt} alt={selectedTrack.title} className="purchase-art" />
              <div>
                <h2 className="modal-title">{selectedTrack.title}</h2>
                <p className="purchase-artist">{selectedTrack.artist}</p>
              </div>
            </div>
            <div className="purchase-details">
              <div className="detail-row">
                <span>Price</span>
                <span className="detail-value">${selectedTrack.price}</span>
              </div>
              <div className="detail-row">
                <span>Artist Share</span>
                <span className="detail-value">70%</span>
              </div>
              <div className="detail-row">
                <span>Platform Fee</span>
                <span className="detail-value">30%</span>
              </div>
              <div className="detail-row total">
                <span>Total</span>
                <span className="detail-value">${selectedTrack.price}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowPurchaseModal(false)}>
                Cancel
              </button>
              <button className="modal-btn submit">Complete Purchase</button>
            </div>
          </div>
        </div>
      )}

      <MusicPlayer currentTrack={currentTrack} />
    </div>
  );
};

export default Music;
