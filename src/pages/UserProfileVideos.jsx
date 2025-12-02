import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import VideoCard from '../components/video/VideoCard';
import { Trash2, Edit2 } from 'lucide-react';
import './UserProfile.css';

export const UserProfileVideos = ({ userId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Videos
  const fetchVideos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = data.map(v => ({
        ...v,
        videoUrl: supabase.storage.from('video').getPublicUrl(v.video_url).data.publicUrl,
        thumbnailUrl: v.thumbnail_url
          ? supabase.storage.from('thumbnails').getPublicUrl(v.thumbnail_url).data.publicUrl
          : '/default-thumbnail.jpg'
      }));
      setVideos(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchVideos();
  }, [userId]);

  // --- DELETE VIDEO LOGIC ---
  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase.from('videos').delete().eq('id', videoId);
      if (error) throw error;
      
      // Remove from UI immediately
      setVideos(prev => prev.filter(v => v.id !== videoId));
      alert("Video deleted successfully.");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete video.");
    }
  };

  // --- EDIT VIDEO LOGIC (Simple Title Edit) ---
  const handleEdit = async (videoId, oldTitle) => {
    const newTitle = prompt("Enter new title:", oldTitle);
    if (!newTitle || newTitle === oldTitle) return;

    try {
      const { error } = await supabase
        .from('videos')
        .update({ title: newTitle })
        .eq('id', videoId);

      if (error) throw error;

      // Update UI
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, title: newTitle } : v));
    } catch (err) {
      console.error("Edit Error:", err);
      alert("Failed to update title.");
    }
  };

  if (loading) return <p className="text-white">Loading videos...</p>;
  if (videos.length === 0) return <p className="text-gray-500">No videos uploaded yet.</p>;

  return (
    <div className="profile-videos-grid">
      {videos.map(video => (
        <div key={video.id} className="video-item-wrapper" style={{ position: 'relative' }}>
          {/* Reuse existing VideoCard */}
          <VideoCard video={video} />
          
          {/* Action Buttons Overlay */}
          <div className="video-actions-overlay" style={{
            display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end'
          }}>
            <button 
              onClick={() => handleEdit(video.id, video.title)}
              style={{ background: '#333', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}
              title="Edit Title"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => handleDelete(video.id)}
              style={{ background: '#ef4444', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}
              title="Delete Video"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};