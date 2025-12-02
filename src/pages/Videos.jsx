// src/pages/Videos.jsx
import React, { useState, useEffect } from 'react';
import VideoSidebar from '../components/video/VideoSidebar';
import VideoCard from '../components/video/VideoCard';
import { supabase } from '../lib/supabase';
import { Upload, Plus, Radio } from 'lucide-react'; // <--- Radio Icon Added
import './Videos.css';

const Videos = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [currentUserInfo, setCurrentUserInfo] = useState({
    fullName: 'You',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    userId: null
  });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      const displayName = profile?.full_name?.trim() || user.email?.split('@')[0] || 'User';
      const avatarUrl = profile?.avatar_url
        ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'user'}`;

      setCurrentUserInfo({ fullName: displayName, avatarUrl, userId: user.id });
    };
    fetchUser();
  }, []);

  // Fetch videos
  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (!error && data) setVideos(data);
  };

  useEffect(() => {
    fetchVideos();
    const channel = supabase.channel('videos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'videos' }, payload => {
        if (payload.new.approved) {
          setVideos(prev => [payload.new, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'videos' }, async payload => {
        const { data: updatedVideo, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', payload.new.id)
          .maybeSingle();

        if (!error && updatedVideo?.approved) {
          setVideos(prev => {
            const exists = prev.find(v => v.id === updatedVideo.id);
            if (exists) {
              return prev.map(v => v.id === updatedVideo.id ? updatedVideo : v);
            } else {
              return [updatedVideo, ...prev];
            }
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filteredVideos = activeCategory === 'all'
    ? videos.filter(v => v.approved)
    : videos.filter(v => v.category.toLowerCase() === activeCategory.toLowerCase() && v.approved);


  // --- Helper: generate auto thumbnail ---
  const generateThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      video.addEventListener("loadeddata", () => { video.currentTime = 1; });
      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 320; canvas.height = 180;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => { resolve(blob); }, "image/png", 1);
      });
      video.addEventListener("error", (err) => reject(err));
    });
  };

  // --- Functions to open Modal ---
  const openUploadModal = () => {
      setCategory('Technology'); // Default
      setShowUploadModal(true);
  };

  const openLiveModal = () => {
      setCategory('Live'); // Auto-select Live category
      setShowUploadModal(true);
  };

  // --- Handle Upload ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !title || !currentUserInfo.userId) return;

    setUploading(true);
    setUploadError('');

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // 1. Upload video
      const videoExt = videoFile.name.split('.').pop();
      const videoName = `${crypto.randomUUID()}.${videoExt}`;
      const { error: videoError } = await supabase.storage.from('video').upload(videoName, videoFile, { upsert: false });
      if (videoError) throw videoError;

      // 2. Handle thumbnail
      let thumbnailName = null;
      if (thumbnailFile) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(thumbnailFile.type)) throw new Error('Invalid thumbnail type');
        const ext = thumbnailFile.name.split('.').pop();
        thumbnailName = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('thumbnails').upload(`videos_thumbnail/${thumbnailName}`, thumbnailFile, { upsert: false });
        if (error) throw error;
      } else {
        const blob = await generateThumbnail(videoFile);
        if (!blob) throw new Error("Thumbnail generation failed");
        const fileName = `${crypto.randomUUID()}.png`;
        const { error: thumbError } = await supabase.storage.from('thumbnails').upload(`videos_thumbnail/${fileName}`, blob, { contentType: "image/png" });
        if (thumbError) throw thumbError;
        thumbnailName = fileName;
      }

      // 3. Insert into table
      const { data: insertedVideo, error: insertError } = await supabase
        .from('videos')
        .insert({
          title, description, category,
          video_url: videoName,
          thumbnail_url: `videos_thumbnail/${thumbnailName}`,
          uploaded_by: user.id,
          approved: false
        })
        .select().single();

      if (insertError) throw insertError;

      // 4. Update UI
      setVideos(prev => [insertedVideo, ...prev]);
      setShowUploadModal(false);
      setVideoFile(null); setThumbnailFile(null);
      setTitle(''); setDescription(''); setCategory('Technology');

    } catch (err) {
      console.error('Upload Error:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="videos-page">
      <VideoSidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <main className="videos-content">
        <div className="videos-header">
          <div>
            <h1 className="videos-title">
              {activeCategory === 'all' ? 'All Videos' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
            </h1>
            <p className="videos-subtitle">{filteredVideos.length} videos available</p>
          </div>
          
          {/* --- NEW BUTTONS SECTION --- */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="live-btn" onClick={openLiveModal}>
                <Radio size={20} /> Go Live
            </button>
            <button className="upload-btn" onClick={openUploadModal}>
                <Plus size={20} /> Upload Video
            </button>
          </div>

        </div>

        <div className="videos-grid">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={{
                ...video,
                videoUrl: supabase.storage.from('video').getPublicUrl(video.video_url).data.publicUrl,
                thumbnailUrl: video.thumbnail_url
                  ? supabase.storage.from('thumbnails').getPublicUrl(video.thumbnail_url).data.publicUrl
                  : '/default-thumbnail.jpg'
              }}
            />
          ))}
        </div>

        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">
                  {category === 'Live' ? 'Go Live (Upload Stream)' : 'Upload Video'}
              </h2>
              {uploadError && <p className="text-red-500 text-center font-bold mb-4">{uploadError}</p>}

              <form onSubmit={handleUpload}>
                <div className="upload-area">
                  <Upload size={48} className="upload-icon" />
                  <h3 className="upload-text">Select Video</h3>
                  <input type="file" className="file-input" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} required />
                </div>
                <div className="upload-area">
                  <Upload size={48} className="upload-icon" />
                  <h3 className="upload-text">Select Thumbnail (Optional)</h3>
                  <input type="file" className="file-input" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} />
                </div>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Enter video title" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-textarea" rows={4} placeholder="Enter video description" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="form-select">
                    <option>Technology</option>
                    <option>Gaming</option>
                    <option>Music</option>
                    <option>Education</option>
                    <option>Entertainment</option>
                    <option>Movies</option>
                    <option>Live</option> {/* Live option included */}
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-btn cancel" onClick={() => setShowUploadModal(false)}>Cancel</button>
                  <button type="submit" className="modal-btn submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : (category === 'Live' ? 'Start Stream' : 'Upload Video')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Videos;