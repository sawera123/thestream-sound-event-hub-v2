// src/pages/Music.jsx → Audio Upload + Optional Thumbnail + Subscription Limit
import React, { useState, useEffect } from 'react';
import MusicCard from '../components/music/MusicCard';
import MusicPlayer from '../components/music/MusicPlayer';
import { Upload, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Music.css';

const Music = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [price, setPrice] = useState('2.99');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [uploadCount, setUploadCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch tracks & user subscription info
  useEffect(() => {
    const fetchTracksAndSubscription = async () => {
      const { data } = await supabase
        .from('content_uploads')
        .select('*')
        .eq('status', 'approved')
        .eq('type', 'audio')
        .order('created_at', { ascending: false });

      if (data) {
        setTracks(data.map(t => ({
          id: t.id,
          title: t.title,
          artist: 'Artist',
          price: t.price,
          albumArt: t.cover_path
            ? supabase.storage.from('thumbnails').getPublicUrl(t.cover_path).data.publicUrl
            : '/default-thumbnail.jpg',
          audioUrl: supabase.storage.from('content').getPublicUrl(t.file_path).data.publicUrl
        })));
      }

      // Get current user info
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        // Count user's uploads (pending + approved)
        const { data: userUploads } = await supabase
          .from('content_uploads')
          .select('id')
          .eq('uploaded_by', user.id)
          .in('status', ['pending', 'approved']);
        setUploadCount(userUploads?.length || 0);

        // Check subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();
        setIsSubscribed(subscription?.status === 'active');
      }
    };

    fetchTracksAndSubscription();

    const channel = supabase.channel('content_uploads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_uploads' }, fetchTracksAndSubscription)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleUpload = async (e) => {
  e.preventDefault();
  if (!audioFile || !title) return;

  setUploading(true);
  setUploadError('');

  try {
    // 1️⃣ Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) throw new Error('User not authenticated');

    // 2️⃣ Count user's uploads (pending + approved)
    const { data: userUploads, error: uploadError } = await supabase
      .from('content_uploads')
      .select('id')
      .eq('uploaded_by', user.id)
      .in('status', ['pending', 'approved']);
    if (uploadError) throw uploadError;

    const uploadCount = userUploads?.length || 0;

    // 3️⃣ Check subscription status
    const { data: subscriptionData, error: subError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();
    if (subError) throw subError;

    const isSubscribed = subscriptionData?.status === 'active';

    // 4️⃣ Enforce free user limit
    if (!isSubscribed && uploadCount >= 3) {
      setUploadError('Free limit reached: You can upload only 3 tracks. Subscribe for unlimited uploads.');
      setUploading(false);
      return; // Stop upload
    }

    // 5️⃣ Upload audio file
    const fileExt = audioFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error: fileUploadError } = await supabase.storage
      .from('content')
      .upload(`media/${fileName}`, audioFile, { upsert: false });
    if (fileUploadError) throw fileUploadError;

    // 6️⃣ Upload optional cover / thumbnail
    let coverName = null;
    if (coverFile) {
      const coverExt = coverFile.name.split('.').pop();
      coverName = `${crypto.randomUUID()}.${coverExt}`;
      const { error: coverUploadError } = await supabase.storage
        .from('thumbnails')
        .upload(`audio_thumbnail/${coverName}`, coverFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: coverFile.type
        });
      if (coverUploadError) throw coverUploadError;
    }

    // 7️⃣ Insert into DB
    const { error: insertError } = await supabase
      .from('content_uploads')
      .insert({
        title,
        type: 'audio',
        price: parseFloat(price),
        file_path: `media/${fileName}`,
        cover_path: coverName ? `audio_thumbnail/${coverName}` : null,
        uploaded_by: user.id,
        uploader_ip: '0.0.0.0',
        status: 'pending'
      });
    if (insertError) throw insertError;

    alert('Uploaded successfully! Waiting for admin approval.');
    setShowUploadModal(false);
    setTitle('');
    setPrice('2.99');
    setAudioFile(null);
    setCoverFile(null);

  } catch (err) {
    console.error("Upload Error:", err);
    setUploadError(err.message || 'Upload failed. Please try again.');
  } finally {
    setUploading(false);
  }
};


  const handlePlay = (track) => setCurrentTrack(track);
  const handlePurchase = (track) => {
    setSelectedTrack(track);
    setShowPurchaseModal(true);
  };

  return (
    <div className="music-page">
      {/* Header */}
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
          <button className="filter-btn"><Filter size={18} /></button>
          <button className="upload-music-btn" onClick={() => setShowUploadModal(true)}>
            <Upload size={18} /> Upload Track
          </button>
        </div>
      </div>

      {/* Music grid */}
      <div className="music-grid">
        {tracks.map(track => (
          <MusicCard key={track.id} track={track} onPlay={handlePlay} onPurchase={handlePurchase} />
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Upload Your Audio</h2>
            {uploadError && <p className="text-red-500 text-center font-bold mb-4">{uploadError}</p>}
            {!isSubscribed && uploadCount >= 3 && (
              <p className="text-red-500 font-bold text-center mb-2">
                Free limit reached: You can upload only 3 tracks. Subscribe for unlimited uploads.
              </p>
            )}
            <form onSubmit={handleUpload}>
              <div className="upload-section">
                <div className="upload-box">
                  <Upload size={40} className="upload-icon" />
                  <p className="upload-title">Upload Audio File</p>
                  <p className="upload-hint">MP3, WAV (Max 50MB)</p>
                  <input type="file" className="file-input" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} required />
                </div>
                <div className="upload-box">
                  <Upload size={40} className="upload-icon" />
                  <p className="upload-title">Upload Album Art (Optional)</p>
                  <p className="upload-hint">JPG, PNG (Min 1000x1000px)</p>
                  <input type="file" className="file-input" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Track Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Enter track title" required />
              </div>
              <div className="form-group">
                <label className="form-label">Genre</label>
                <select value={genre} onChange={e => setGenre(e.target.value)} className="form-select">
                  <option>Electronic</option><option>Hip-Hop</option><option>Rock</option><option>Jazz</option><option>Pop</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (USD)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="form-input" placeholder="2.99" step="0.01" required />
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-btn cancel" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="modal-btn submit" disabled={uploading || (!isSubscribed && uploadCount >= 3)}>
                  {uploading ? 'Uploading...' : 'Publish Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedTrack && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content purchase-modal" onClick={e => e.stopPropagation()}>
            <div className="purchase-header">
              <img src={selectedTrack.albumArt} alt={selectedTrack.title} className="purchase-art" />
              <div>
                <h2 className="modal-title">{selectedTrack.title}</h2>
                <p className="purchase-artist">{selectedTrack.artist}</p>
              </div>
            </div>
            <div className="purchase-details">
              <div className="detail-row"><span>Price</span><span className="detail-value">${selectedTrack.price}</span></div>
              <div className="detail-row"><span>Artist Share</span><span className="detail-value">70%</span></div>
              <div className="detail-row"><span>Platform Fee</span><span className="detail-value">30%</span></div>
              <div className="detail-row total"><span>Total</span><span className="detail-value">${selectedTrack.price}</span></div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowPurchaseModal(false)}>Cancel</button>
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
