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
  
  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [price, setPrice] = useState('2.99');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // User Stats
  const [uploadCount, setUploadCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState(null); // Explicit userId state

  // 1. Fetch Tracks & User Info
  useEffect(() => {
    const fetchTracksAndSubscription = async () => {
      const { data: userAuth } = await supabase.auth.getUser();
      const user = userAuth?.user;
      
      if (user) {
        setUserId(user.id);
        
        // Count uploads
        const { count } = await supabase
          .from('content_uploads')
          .select('*', { count: 'exact', head: true })
          .eq('uploaded_by', user.id)
          .in('status', ['pending', 'approved']);
        setUploadCount(count || 0);

        // Check subscription
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();
        setIsSubscribed(sub?.status === 'active');
      }

      // Fetch Music
      const { data, error } = await supabase
        .from('content_uploads')
        .select('*, profiles (full_name)')
        .eq('status', 'approved')
        .eq('type', 'audio')
        .order('created_at', { ascending: false });

      if (error) console.error("Fetch Error:", error);

      if (data) {
        setTracks(data.map(t => ({
          id: t.id,
          title: t.title,
          artist: t.profiles?.full_name || 'Unknown Artist',
          price: t.price,
          albumArt: t.cover_path
            ? supabase.storage.from('thumbnails').getPublicUrl(t.cover_path).data.publicUrl
            : '/default-thumbnail.jpg',
          audioUrl: supabase.storage.from('content').getPublicUrl(t.file_path).data.publicUrl
        })));
      }
    };

    fetchTracksAndSubscription();
    
    const channel = supabase.channel('content_uploads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_uploads' }, fetchTracksAndSubscription)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 2. Handle Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audioFile || !title) return;
    setUploading(true); setUploadError('');

    try {
      if (!userId) throw new Error('User not authenticated');

      // IP Check
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const userIp = ipData.ip;

      // Limit Check (Secure RPC)
      const { data: limitData, error: limitError } = await supabase
        .rpc('check_upload_limits', { user_id: userId, ip_address: userIp });
      if (limitError) throw limitError;
      
      const currentUploads = limitData?.count || 0;
      
      // Subscription Logic
      const { data: subData } = await supabase.from('subscriptions').select('status, plan').eq('user_id', userId).maybeSingle();
      const isPaid = subData?.status === 'active' && ['standard', 'premium'].includes(subData?.plan);
      const limit = isPaid ? 10 : 3;

      if (currentUploads >= limit) {
        setUploadError(isPaid ? "Max 10 uploads reached." : "Limit reached (3). Upgrade to Premium.");
        setUploading(false); return;
      }

      // Upload Files
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      await supabase.storage.from('content').upload(`media/${fileName}`, audioFile);

      let coverName = null;
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        coverName = `${crypto.randomUUID()}.${coverExt}`;
        await supabase.storage.from('thumbnails').upload(`audio_thumbnail/${coverName}`, coverFile);
      }

      // Save to DB
      await supabase.from('content_uploads').insert({
        title, type: 'audio', price: parseFloat(price),
        file_path: `media/${fileName}`,
        cover_path: coverName ? `audio_thumbnail/${coverName}` : null,
        uploaded_by: userId, uploader_ip: userIp, status: 'pending'
      });

      alert('Uploaded! Waiting for approval.');
      setShowUploadModal(false);
      setTitle(''); setPrice('2.99'); setAudioFile(null); setCoverFile(null);

    } catch (err) {
      console.error("Upload Error:", err);
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Stripe Payment (Correct Logic)
  const handleConfirmPurchase = async () => {
    if (!selectedTrack || !userId) return alert("Please login!");
    setUploading(true);

    try {
      // Determines origin based on environment (fix for HashRouter)
      // If you are using HashRouter (/#/), ensure this matches your URL structure
      const originUrl = window.location.port === "8080" 
        ? 'http://localhost:8080/#' 
        : window.location.origin;

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          track: selectedTrack,
          userId: userId,
          origin: originUrl 
        },
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else alert("Payment session failed.");

    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment failed.");
    } finally {
      setUploading(false);
    }
  };

  const handlePlay = (track) => setCurrentTrack(track);
  const handlePurchase = (track) => { setSelectedTrack(track); setShowPurchaseModal(true); };
  
  const handleNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    setCurrentTrack(tracks[(currentIndex + 1) % tracks.length]);
  };

  const handlePrev = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    setCurrentTrack(tracks[(currentIndex - 1 + tracks.length) % tracks.length]);
  };

  return (
    <div className="music-page">
      <div className="music-header">
        <div><h1 className="music-title">Music Marketplace</h1><p className="music-subtitle">Discover exclusive tracks</p></div>
        <div className="header-actions">
          <button className="upload-music-btn" onClick={() => setShowUploadModal(true)}><Upload size={18} /> Upload Track</button>
        </div>
      </div>

      <div className="music-grid">
        {tracks.map(track => (
          <MusicCard key={track.id} track={track} onPlay={handlePlay} onPurchase={handlePurchase} />
        ))}
      </div>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Upload Audio</h2>
            {uploadError && <p className="text-red-500 font-bold mb-4">{uploadError}</p>}
            <form onSubmit={handleUpload}>
              <div className="upload-section">
                 <div className="upload-box">
                    <p className="upload-title">Audio File</p>
                    <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} required />
                 </div>
                 <div className="upload-box">
                    <p className="upload-title">Cover Art</p>
                    <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
                 </div>
              </div>
              <div className="form-group"><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
              <div className="form-group"><label>Price</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} required /></div>
              
              <div className="modal-actions">
                <button type="button" className="modal-btn cancel" onClick={() => setShowUploadModal(false)}>Cancel</button>
                {/* Fixed: Only Upload button here */}
                <button type="submit" className="modal-btn submit" disabled={uploading || (!isSubscribed && uploadCount >= 3)}>
                  {uploading ? 'Uploading...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURCHASE MODAL - FIXED */}
      {showPurchaseModal && selectedTrack && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content purchase-modal" onClick={e => e.stopPropagation()}>
            <div className="purchase-header">
              <img src={selectedTrack.albumArt} alt={selectedTrack.title} className="purchase-art" />
              <div><h2 className="modal-title">{selectedTrack.title}</h2><p className="purchase-artist">{selectedTrack.artist}</p></div>
            </div>
            <div className="purchase-details">
              <div className="detail-row"><span>Price</span><span className="detail-value">${selectedTrack.price}</span></div>
              <div className="detail-row"><span>Artist Share</span><span className="detail-value">70%</span></div>
              <div className="detail-row"><span>Platform Fee</span><span className="detail-value">30%</span></div>
              <div className="detail-row total"><span>Total</span><span className="detail-value">${selectedTrack.price}</span></div>
            </div>
            
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowPurchaseModal(false)}>Cancel</button>
              {/* Fixed: Only Pay button here */}
              <button className="modal-btn submit" onClick={handleConfirmPurchase} disabled={uploading}>
                {uploading ? 'Processing...' : `Pay $${selectedTrack.price}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <MusicPlayer currentTrack={currentTrack} onNext={handleNext} onPrev={handlePrev} />
    </div>
  );
};

export default Music;