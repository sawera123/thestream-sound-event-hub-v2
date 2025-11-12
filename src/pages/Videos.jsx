import React, { useState } from 'react';
import VideoSidebar from '../components/video/VideoSidebar';
import VideoCard from '../components/video/VideoCard';
import { videosData } from '../data/videosData';
import { Upload, Plus } from 'lucide-react';
import './Videos.css';

const Videos = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredVideos = activeCategory === 'all' 
    ? videosData 
    : videosData.filter(v => v.category.toLowerCase() === activeCategory);

  return (
    <div className="videos-page">
      <VideoSidebar 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <main className="videos-content">
        <div className="videos-header">
          <div>
            <h1 className="videos-title">
              {activeCategory === 'all' ? 'All Videos' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
            </h1>
            <p className="videos-subtitle">
              {filteredVideos.length} videos available
            </p>
          </div>
          <button 
            className="upload-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={20} />
            Upload Video
          </button>
        </div>

        <div className="videos-grid">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Upload Video</h2>
              <div className="upload-area">
                <Upload size={48} className="upload-icon" />
                <h3 className="upload-text">Drag and drop your video here</h3>
                <p className="upload-subtext">or click to browse</p>
                <input type="file" className="file-input" accept="video/*" />
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" placeholder="Enter video title" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows="4" placeholder="Enter video description"></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select">
                  <option>Technology</option>
                  <option>Gaming</option>
                  <option>Music</option>
                  <option>Education</option>
                  <option>Entertainment</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button className="modal-btn submit">Upload Video</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Videos;
