// src/pages/VideoPlayer.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, Share2, Download, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './VideoPlayer.css';
import { useNavigate } from 'react-router-dom';

// ---- YouTube Style Views Formatter ----
function formatViews(num) {
  if (num < 1000) return num + " views";
  if (num < 1_000_000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K views";
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1) + "M views";
  return (num / 1_000_000_000).toFixed(1) + "B views";
}


const VideoPlayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const videoId = parseInt(id, 10);

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [channelInfo, setChannelInfo] = useState({ name: '', avatar: '' });
  const [subscribed, setSubscribed] = useState(false);
  const [notify, setNotify] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const [currentUserInfo, setCurrentUserInfo] = useState({
    fullName: 'You',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    userId: null
  });

  // ------------------- Fetch Current User -------------------
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) return;

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

  // ------------------- Load Video + Views + Likes + Comments -------------------
  useEffect(() => {
    if (!videoId || currentUserInfo.userId === null) return;
const registerView = async () => {
  if (!currentUserInfo.userId) return;

  try {
    // Add or update view for current user
    await supabase
      .from('video_views')
      .upsert({
        video_id: videoId,
        user_id: currentUserInfo.userId,
        last_watched: new Date().toISOString()
      }, { onConflict: ['user_id', 'video_id'] });

    // Fetch total views for this video
    const { data, error } = await supabase
      .from('video_views')
      .select('id') // sirf rows fetch kar rahe, actual data ki zarurat nahi
      .eq('video_id', videoId);

    if (error) throw error;

    setTotalViews(data.length); // exact number of rows = total unique views
  } catch (err) {
    console.error('Error registering view:', err);
  }
};


    const loadVideoData = async () => {
      try {
        // ------------------- Video -------------------
        const { data: vid, error: vidError } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();
        if (vidError || !vid) return console.error('Video not found');

        const videoUrl = supabase.storage.from('video').getPublicUrl(vid.video_url).data.publicUrl;
        const thumbUrl = vid.thumbnail_url
          ? supabase.storage.from('thumbnails').getPublicUrl(vid.thumbnail_url).data.publicUrl
          : '/default-thumbnail.jpg';

        setVideo({ ...vid, videoUrl, thumbUrl });

        await registerView();

        // ------------------- Likes -------------------
        const { count: likesCount } = await supabase
          .from('video_likes')
          .select('*', { count: 'exact', head: true })
          .eq('video_id', videoId)
          .eq('is_like', true);
        setTotalLikes(likesCount || 0);

        if (currentUserInfo.userId) {
          const { data: userLike } = await supabase
            .from('video_likes')
            .select('is_like')
            .eq('video_id', videoId)
            .eq('user_id', currentUserInfo.userId)
            .maybeSingle();
          setLiked(!!userLike?.is_like);
        }

        // ------------------- Channel Info -------------------
        const { data: channel } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', vid.uploaded_by)
          .maybeSingle();
        setChannelInfo({
          name: channel?.full_name || 'Unknown Channel',
          avatar: channel?.avatar_url
            ? supabase.storage.from('avatars').getPublicUrl(channel.avatar_url).data.publicUrl
            : 'https://api.dicebear.com/7.x/avataaars/svg?seed=channel',
        });

        // ------------------- Comments -------------------
        const { data: commentsWithProfiles } = await supabase.rpc('get_comments_with_profiles', { vid: videoId });
        const fixedComments = commentsWithProfiles?.map(c => ({
          id: c.id,
          comment: c.comment,
          created_at: c.created_at,
          username: c.full_name?.trim() || 'User',
          avatarUrl: c.avatar_url
            ? supabase.storage.from('avatars').getPublicUrl(c.avatar_url).data.publicUrl
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_id}`
        })) || [];
        setComments(fixedComments);

        // ------------------- Recommended Videos -------------------
        const { data: recs, error: recError } = await supabase
  .from('videos')
  .select(`
    *,
    video_views (id)
  `)
  .eq('approved', true)
  .neq('id', videoId)
  .limit(5);


        if (recError) console.error("Recommended videos error:", recError);

        const enhancedRecs = recs?.map(rec => ({
          ...rec,
          thumbUrl: rec.thumbnail_url
            ? supabase.storage.from('thumbnails').getPublicUrl(rec.thumbnail_url).data.publicUrl
            : '/default-thumbnail.jpg',
          videoUrl: supabase.storage.from('video').getPublicUrl(rec.video_url).data.publicUrl
        })) || [];

        setRecommendedVideos(enhancedRecs);

      } catch (err) {
        console.error('Error loading video data:', err);
      }
    };

    loadVideoData();
  }, [videoId, currentUserInfo.userId]);

  // ------------------- Toggle Like -------------------
  const toggleLike = async () => {
    if (!currentUserInfo?.userId) return alert("Please login!");

    const newLikedState = !liked;
    const newTotalLikes = totalLikes + (newLikedState ? 1 : -1);

    setLiked(newLikedState);
    setTotalLikes(newTotalLikes);

    try {
      const { data, error } = await supabase.rpc('toggle_like', {
        p_video_id: videoId,
        p_user_id: currentUserInfo.userId
      });
      if (error) throw error;

      if (data?.length) {
        setLiked(data[0].is_liked);
        setTotalLikes(data[0].total_likes);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setLiked(liked);
      setTotalLikes(totalLikes);
    }
  };

  // ------------------- Add Comment -------------------
  const addComment = async () => {
    if (!commentText.trim() || !currentUserInfo.userId) return;

    const optimisticComment = {
      id: Date.now(),
      comment: commentText.trim(),
      created_at: new Date().toISOString(),
      username: currentUserInfo.fullName,
      avatarUrl: currentUserInfo.avatarUrl
    };
    setComments(prev => [optimisticComment, ...prev]);
    setCommentText('');

    const { data } = await supabase.from('video_comments')
      .insert({ video_id: videoId, user_id: currentUserInfo.userId, comment: optimisticComment.comment })
      .select()
      .single();

    if (data) {
      setComments(prev => prev.map(c => c.id === optimisticComment.id
        ? { ...data, username: currentUserInfo.fullName, avatarUrl: currentUserInfo.avatarUrl }
        : c));
    } else {
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
    }
  };

  // ------------------- Load Subscription -------------------
  const loadSubscription = async (channelId) => {
    if (!channelId) return;

    try {
      let isSubscribed = false;
      let notifySetting = false;

      if (currentUserInfo.userId) {
        const { data: sub } = await supabase
          .from('channel_subscriptions')
          .select('id, notify')
          .eq('user_id', currentUserInfo.userId)
          .eq('channel_id', channelId)
          .maybeSingle();

        isSubscribed = !!sub;
        notifySetting = sub?.notify || false;
      }

      setSubscribed(isSubscribed);
      setNotify(notifySetting);

      // ------------------- Fetch total subscribers using RPC -------------------
      const { data: totalSubscribers, error } = await supabase
        .rpc('get_channel_subscriber_count', { p_channel_id: channelId });

      if (error) console.error('Subscriber count RPC error:', error);

      setSubscriberCount(totalSubscribers || 0);

    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  useEffect(() => {
    if (video?.uploaded_by && currentUserInfo.userId !== null) {
      loadSubscription(video.uploaded_by);
    }
  }, [video, currentUserInfo.userId]);

  // ------------------- Toggle Subscribe -------------------
  const toggleSubscribe = async () => {
    if (!currentUserInfo.userId || !video?.uploaded_by) return alert('Please login!');

    try {
      if (subscribed) {
        // Unsubscribe
        const { error } = await supabase
          .from('channel_subscriptions')
          .delete()
          .eq('user_id', currentUserInfo.userId)
          .eq('channel_id', video.uploaded_by);
        if (error) throw error;
      } else {
        // Subscribe using UPSERT
        const { error } = await supabase
          .from('channel_subscriptions')
          .upsert(
            {
              user_id: currentUserInfo.userId,
              channel_id: video.uploaded_by,
              notify: false
            },
            { onConflict: ['user_id', 'channel_id'] }
          );
        if (error) throw error;
      }

      await loadSubscription(video.uploaded_by);
    } catch (err) {
      console.error('Subscription error:', err);
    }
  };

  // ------------------- Toggle Bell Notification -------------------
  const toggleNotify = async () => {
    if (!currentUserInfo.userId || !video?.uploaded_by) return;

    try {
      const { error } = await supabase
        .from('channel_subscriptions')
        .update({ notify: !notify })
        .eq('user_id', currentUserInfo.userId)
        .eq('channel_id', video.uploaded_by);
      if (error) throw error;

      setNotify(prev => !prev);
    } catch (err) {
      console.error('Notification toggle error:', err);
    }
  };

  if (!video) return <div className="text-center py-20 text-3xl text-white">Video Not Found</div>;

  return (
     <div className="youtube-page">
      <div className="youtube-main-content">
        {/* Video */}
        <div className="youtube-video-wrapper">
         <video
  key={videoId}   // <<---- MAGIC FIX
  className="youtube-video-element"
  controls
  poster={video.thumbUrl}
>
  <source src={video.videoUrl} type="video/mp4" />
</video>

        </div>

        {/* Video Info */}
        <div className="youtube-video-info">
          <h1 className="youtube-title">{video.title}</h1>

          {/* Channel Info + Subscribe */}
          <div className="youtube-channel-bar">
            <div className="youtube-channel-info">
              <img src={channelInfo.avatar} alt={channelInfo.name} className="youtube-channel-avatar" />
              <div>
                <span className="youtube-channel-name">{channelInfo.name}</span>
                <span className="youtube-subscribers">{subscriberCount.toLocaleString()} subscribers</span>
              </div>
            </div>

            <div className="youtube-subscribe-group">
              <button
                className={`youtube-subscribe-btn ${subscribed ? 'subscribed' : ''}`}
                disabled={!currentUserInfo.userId || !video?.uploaded_by}
                onClick={toggleSubscribe}
              >
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>

              {subscribed && (
                <button
                  className={`youtube-bell-btn ${notify ? 'notify-on' : ''}`}
                  disabled={!currentUserInfo.userId || !video?.uploaded_by}
                  onClick={toggleNotify}
                >
                  <Bell size={18} />
                </button>       
              )}
            </div>
          </div>

          {/* Views & Date */}
          <div className="youtube-meta">
            <span>{formatViews(totalViews)}</span> •
            <span>{new Date(video.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>

          {/* Actions */}
          <div className="youtube-actions">
            <button className={`youtube-like-btn ${liked ? 'liked' : ''}`} onClick={toggleLike}>
              <ThumbsUp size={20} fill={liked ? 'currentColor' : 'none'} /> {totalLikes.toLocaleString()}
            </button>
            <button className="youtube-action-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              <Share2 size={20} /> Share
            </button>
            <button className="youtube-action-btn" onClick={() => {
              const a = document.createElement('a');
              a.href = video.videoUrl;
              a.download = `${video.title}.mp4`;
              a.click();
            }}>
              <Download size={20} /> Download
            </button>
          </div>

          {/* Description */}
          <div className="youtube-description">{video.description || 'No description'}</div>
        </div>

        {/* Comments Section */}
        <div className="youtube-comments-section">
          <h2 className="youtube-comments-title">{comments.length} Comments</h2>
          <div className="youtube-add-comment">
            <img src={currentUserInfo.avatarUrl} alt={currentUserInfo.fullName} className="youtube-comment-avatar" />
            <input
              type="text"
              className="youtube-comment-input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addComment()}
            />
            <button className="youtube-comment-submit" onClick={addComment} disabled={!commentText.trim()}>
              Comment
            </button>
          </div>
          <div className="youtube-comments-list">
            {comments.map(c => (
              <div key={c.id} className="youtube-comment-item">
                <img src={c.avatarUrl} alt={c.username} className="youtube-comment-avatar" />
                <div className="youtube-comment-content">
                  <span className="youtube-comment-author">{c.username}</span>
                  <span className="youtube-comment-time">{new Date(c.created_at).toLocaleDateString()}</span>
                  <p className="youtube-comment-text">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="youtube-sidebar">
  <h3 className="youtube-sidebar-title">Recommended Videos</h3>

  {recommendedVideos.map(rec => (
    <div
      key={rec.id}
      className="youtube-recommended-item"
      onClick={() => {
        setVideo(null); // FORCE destroy old video
        navigate(`/video/${rec.id}`);
      }}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={rec.thumbUrl}
        alt={rec.title}
        className="youtube-recommended-thumb"
      />

      <div>
        <span className="youtube-recommended-title">{rec.title}</span>

        <span className="youtube-recommended-views">
          {rec.video_views?.length || 0} views
        </span>
      </div>
    </div>
  ))}

</div>

    </div>
  );
};

export default VideoPlayer;
