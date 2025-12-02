import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import MusicCard from '../components/music/MusicCard'; // Ensure path is correct
import { Trash2, Edit2 } from 'lucide-react';

export const UserProfileMusic = ({ userId }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Music Logic
  const fetchMusic = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('content_uploads')
      .select('*, profiles(full_name)')
      .eq('uploaded_by', userId)
      .eq('type', 'audio')
      .order('created_at', { ascending: false });

    if (data) {
      setTracks(data.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.profiles?.full_name || 'Unknown',
        price: t.price,
        albumArt: t.cover_path
          ? supabase.storage.from('thumbnails').getPublicUrl(t.cover_path).data.publicUrl
          : '/default-thumbnail.jpg',
        audioUrl: supabase.storage.from('content').getPublicUrl(t.file_path).data.publicUrl
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchMusic();
  }, [userId]);

  // 2. Delete Logic
  const handleDelete = async (trackId) => {
    if (!window.confirm("Are you sure you want to delete this track?")) return;

    try {
      const { error } = await supabase.from('content_uploads').delete().eq('id', trackId);
      if (error) throw error;
      
      // Update UI immediately
      setTracks(prev => prev.filter(t => t.id !== trackId));
      alert("Track deleted successfully.");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete track.");
    }
  };

  // 3. Edit Logic (Title & Price)
  const handleEdit = async (track) => {
    const newTitle = prompt("Enter new title:", track.title);
    if (newTitle === null) return; // Cancelled

    const newPrice = prompt("Enter new price ($):", track.price);
    if (newPrice === null) return;

    try {
      const { error } = await supabase
        .from('content_uploads')
        .update({ title: newTitle, price: parseFloat(newPrice) })
        .eq('id', track.id);

      if (error) throw error;

      // Update UI immediately
      setTracks(prev => prev.map(t => t.id === track.id ? { ...t, title: newTitle, price: newPrice } : t));
    } catch (err) {
      console.error("Edit Error:", err);
      alert("Failed to update track.");
    }
  };

  if (loading) return <p className="text-white">Loading music...</p>;
  if (tracks.length === 0) return <p className="text-gray-500">No music uploaded yet.</p>;

  return (
    <div className="profile-music-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
      {tracks.map(track => (
        <div key={track.id} style={{ background: '#1e1e1e', borderRadius: '12px', padding: '15px', position: 'relative' }}>
          
          {/* Reuse your existing Music Card */}
          <MusicCard 
            track={track} 
            onPlay={() => {}} 
            onPurchase={() => {}} 
          />

          {/* --- EDIT & DELETE BUTTONS --- */}
          <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px', 
              marginTop: '15px', 
              borderTop: '1px solid #333', 
              paddingTop: '10px' 
          }}>
            <button 
              onClick={() => handleEdit(track)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#333', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', fontSize: '13px' }}
            >
              <Edit2 size={14} /> Edit
            </button>
            <button 
              onClick={() => handleDelete(track.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', fontSize: '13px' }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>

        </div>
      ))}
    </div>
  );
};