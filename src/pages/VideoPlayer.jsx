import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ThumbsUp, ThumbsDown, Share2, Download, Bell, Scissors, 
  MessageCircle, MoreVertical, Edit2, Trash2, Flag, PlusSquare 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './VideoPlayer.css';

// ---- Helper: Avatar Generator ----
const getAvatarUrl = (url, name) => {
  if (url && typeof url === 'string' && url.length > 5) return url;
  const safeName = name ? name.replace(/\s+/g, '+') : 'User';
  return `https://ui-avatars.com/api/?name=${safeName}&background=0D8ABC&color=fff&size=128&bold=true`;
};

// ---- Helper: View Formatter ----
function formatViews(num) {
  if (num < 1000) return num + " views";
  if (num < 1_000_000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K views";
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1) + "M views";
  return (num / 1_000_000_000).toFixed(1) + "B views";
}

// ==========================================
//  SUB-COMPONENT: Single Comment Item
// ==========================================
const CommentItem = ({ comment, currentUser, videoId, refreshComments }) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userStatus, setUserStatus] = useState(null); 
  
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  // Menu States
  const [showMenu, setShowMenu] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [editText, setEditText] = useState(comment.comment); 

  useEffect(() => { fetchReactions(); }, [comment.id, currentUser.userId]);

  const fetchReactions = async () => {
    const { count: l } = await supabase.from('comment_likes').select('*', { count: 'exact', head: true }).eq('comment_id', comment.id).eq('is_like', true);
    const { count: d } = await supabase.from('comment_likes').select('*', { count: 'exact', head: true }).eq('comment_id', comment.id).eq('is_like', false);
    setLikes(l || 0); setDislikes(d || 0);

    if (currentUser.userId) {
      const { data } = await supabase.from('comment_likes').select('is_like').eq('comment_id', comment.id).eq('user_id', currentUser.userId).maybeSingle();
      setUserStatus(data ? data.is_like : null);
    }
  };

  const handleReaction = async (isLike) => {
    if (!currentUser.userId) return alert("Please login to react!");
    const oldStatus = userStatus;
    // Toggle logic for UI immediately
    setUserStatus(isLike === oldStatus ? null : isLike);

    const { data, error } = await supabase.rpc('toggle_comment_like', {
      p_comment_id: comment.id, p_user_id: currentUser.userId, p_is_like: isLike
    });

    if (error) setUserStatus(oldStatus); // Revert if error
    else if (data && data[0]) {
      setLikes(data[0].likes_count);
      setDislikes(data[0].dislikes_count);
      setUserStatus(data[0].user_status);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim() || !currentUser.userId) return;
    const { error } = await supabase.from('video_comments').insert({
      video_id: videoId, user_id: currentUser.userId, comment: replyText, parent_id: comment.id
    });
    if (!error) { setReplyText(''); setShowReplyInput(false); refreshComments(); setShowReplies(true); }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    const { error } = await supabase.from('video_comments').update({ comment: editText }).eq('id', comment.id);
    if (!error) { setIsEditing(false); setShowMenu(false); refreshComments(); }
  };

  const handleDelete = async () => {
    if(!window.confirm("Delete this comment?")) return;
    const { error } = await supabase.from('video_comments').delete().eq('id', comment.id);
    if (!error) refreshComments();
  };

  const handleReport = async () => {
    const reason = window.prompt("Reason for reporting:");
    if(reason) alert("Report submitted.");
    setShowMenu(false);
  };

  const isOwner = currentUser.userId === comment.user_id;

  return (
    <div className="comment-thread">
      <div className="youtube-comment-item">
        <img src={comment.avatarUrl} alt={comment.username} className="youtube-comment-avatar" />
        <div className="youtube-comment-content" style={{ width: '100%' }}>
          <div className="comment-header">
            <div>
              <span className="youtube-comment-author">{comment.username}</span>
              <span className="youtube-comment-time">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            {currentUser.userId && !isEditing && (
              <div className="menu-container">
                <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}><MoreVertical size={16} /></button>
                {showMenu && (
                  <div className="dropdown-menu">
                    {isOwner ? (
                      <>
                        <button onClick={() => { setIsEditing(true); setShowMenu(false); }}><Edit2 size={14} /> Edit</button>
                        <button onClick={handleDelete}><Trash2 size={14} /> Delete</button>
                      </>
                    ) : (
                      <button onClick={handleReport}><Flag size={14} /> Report</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="edit-box">
              <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="edit-input" />
              <div className="edit-actions">
                <button onClick={() => setIsEditing(false)} className="cancel-edit-btn">Cancel</button>
                <button onClick={handleEdit} className="save-edit-btn">Save</button>
              </div>
            </div>
          ) : (
            <p className="youtube-comment-text">{comment.comment}</p>
          )}

          {!isEditing && (
            <div className="comment-actions">
              <button className={`action-btn ${userStatus === true ? 'active' : ''}`} onClick={() => handleReaction(true)}><ThumbsUp size={14} /> {likes || ''}</button>
              <button className={`action-btn ${userStatus === false ? 'active' : ''}`} onClick={() => handleReaction(false)}><ThumbsDown size={14} /> {dislikes || ''}</button>
              <button className="action-btn" onClick={() => setShowReplyInput(!showReplyInput)}>Reply</button>
            </div>
          )}

          {showReplyInput && (
            <div className="reply-input-box">
              <input type="text" placeholder="Add a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} />
              <div className="reply-buttons">
                 <button onClick={() => setShowReplyInput(false)} className="cancel-btn">Cancel</button>
                 <button onClick={submitReply} disabled={!replyText.trim()} className="reply-btn">Reply</button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="nested-replies">
               {!showReplies ? (
                 <button className="show-replies-btn" onClick={() => setShowReplies(true)}><MessageCircle size={14} /> {comment.replies.length} replies</button>
               ) : (
                 <div className="replies-list">
                    {comment.replies.map(reply => (
                      <CommentItem key={reply.id} comment={reply} currentUser={currentUser} videoId={videoId} refreshComments={refreshComments} />
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
//  MAIN PAGE
// ==========================================
const VideoPlayer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const videoId = parseInt(id, 10);
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  
  const [liked, setLiked] = useState(null); 
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalDislikes, setTotalDislikes] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  
  const [commentText, setCommentText] = useState('');
  const [channelInfo, setChannelInfo] = useState({ name: '', avatar: '' });
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [currentUserInfo, setCurrentUserInfo] = useState({ fullName: 'You', avatarUrl: '', userId: null });
  const [notify, setNotify] = useState(false);

  // Load User
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const name = profile?.full_name || user.email?.split('@')[0] || 'User';
      const av = getAvatarUrl(profile?.avatar_url, name);
      setCurrentUserInfo({ fullName: name, avatarUrl: av, userId: user.id });
    };
    fetchUser();
  }, []);

  // Load Video
  useEffect(() => {
    if (!videoId) return;
    const loadAll = async () => {
       const { data: vid } = await supabase.from('videos').select('*').eq('id', videoId).single();
       if(vid) {
         const vUrl = supabase.storage.from('video').getPublicUrl(vid.video_url).data.publicUrl;
         let tUrl = '/default-thumbnail.jpg';
         if(vid.thumbnail_url) {
             tUrl = vid.thumbnail_url.startsWith('http') ? vid.thumbnail_url : supabase.storage.from('thumbnails').getPublicUrl(vid.thumbnail_url).data.publicUrl;
         }
         setVideo({ ...vid, videoUrl: vUrl, thumbUrl: tUrl });
         
         const { data: ch } = await supabase.from('profiles').select('*').eq('id', vid.uploaded_by).maybeSingle();
         const chName = ch?.full_name || 'Unknown Channel';
         setChannelInfo({ name: chName, avatar: getAvatarUrl(ch?.avatar_url, chName)});
         
         if(currentUserInfo.userId) {
            const { data: sub } = await supabase.from('channel_subscriptions').select('*').eq('user_id', currentUserInfo.userId).eq('channel_id', vid.uploaded_by).maybeSingle();
            setSubscribed(!!sub);
            setNotify(sub?.notify);
         }
         const { data: subCount } = await supabase.rpc('get_channel_subscriber_count', { p_channel_id: vid.uploaded_by });
         setSubscriberCount(subCount || 0);
         
         const { count: lc } = await supabase.from('video_likes').select('*', {count:'exact', head:true}).eq('video_id', videoId).eq('is_like', true);
         const { count: dc } = await supabase.from('video_likes').select('*', {count:'exact', head:true}).eq('video_id', videoId).eq('is_like', false);
         setTotalLikes(lc || 0); setTotalDislikes(dc || 0);
         
         if(currentUserInfo.userId) {
            const { data: ur } = await supabase.from('video_likes').select('is_like').eq('video_id', videoId).eq('user_id', currentUserInfo.userId).maybeSingle();
            setLiked(ur?.is_like ?? null);
         }

         await supabase.from('video_views').upsert({ video_id: videoId, user_id: currentUserInfo.userId, last_watched: new Date().toISOString() }, { onConflict: ['user_id', 'video_id'] });
         const { data: vdata } = await supabase.from('video_views').select('id').eq('video_id', videoId);
         setTotalViews(vdata?.length || 0);
       }
       
       loadComments();

       const { data: recs } = await supabase.from('videos').select('*, video_views(id)').neq('id', videoId).limit(5);
       if(recs) {
         setRecommendedVideos(recs.map(r => {
             let thumb = '/default-thumbnail.jpg';
             if (r.thumbnail_url) thumb = r.thumbnail_url.startsWith('http') ? r.thumbnail_url : supabase.storage.from('thumbnails').getPublicUrl(r.thumbnail_url).data.publicUrl;
             return { ...r, thumbUrl: thumb };
         }));
       }
    };
    loadAll();
  }, [videoId, currentUserInfo.userId]);

  const loadComments = async () => {
    const { data: allComments } = await supabase.rpc('get_comments_with_profiles', { vid: videoId });
    if(!allComments) return;
    const formatted = allComments.map(c => ({
        id: c.id, comment: c.comment, created_at: c.created_at, parent_id: c.parent_id,
        username: c.full_name?.trim() || 'User', avatarUrl: getAvatarUrl(c.avatar_url, c.full_name),
        user_id: c.user_id, replies: []
    }));
    const commentMap = {}; const rootComments = [];
    formatted.forEach(c => { commentMap[c.id] = c; });
    formatted.forEach(c => {
        if(c.parent_id && commentMap[c.parent_id]) commentMap[c.parent_id].replies.push(c);
        else if (!c.parent_id) rootComments.push(c);
    });
    rootComments.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    setComments(rootComments);
  };

  const addRootComment = async () => {
    if (!commentText.trim() || !currentUserInfo.userId) return;
    await supabase.from('video_comments').insert({ video_id: videoId, user_id: currentUserInfo.userId, comment: commentText });
    setCommentText(''); loadComments();
  };

  // --- ACTIONS (FIXED TOGGLE LOGIC) ---
 // --- ACTIONS (FIXED TOGGLE LOGIC) ---
  const toggleReaction = async (reaction) => {
    if (!currentUserInfo?.userId) return alert("Please login!");
    
    // 1. Store old state in case we need to revert (Backup)
    const oldLiked = liked;
    const oldTotalLikes = totalLikes;
    const oldTotalDislikes = totalDislikes;

    // 2. Calculate New State Locally (Optimistic UI)
    // If I clicked 'Like' (true) and I already 'Liked' (true) -> toggle to null
    const newLikedState = (reaction === liked) ? null : reaction;

    // 3. Update Buttons Immediately
    setLiked(newLikedState);

    // 4. Update Numbers Immediately (Visual trick)
    if (newLikedState === true) {
        setTotalLikes(prev => prev + 1);
        if (oldLiked === false) setTotalDislikes(prev => prev - 1);
    } else if (newLikedState === false) {
        setTotalDislikes(prev => prev + 1);
        if (oldLiked === true) setTotalLikes(prev => prev - 1);
    } else {
        // We removed a reaction
        if (oldLiked === true) setTotalLikes(prev => prev - 1);
        if (oldLiked === false) setTotalDislikes(prev => prev - 1);
    }
    
    // 5. Send to Database
    const { data, error } = await supabase.rpc('toggle_like_dislike', { 
        p_video_id: videoId, 
        p_user_id: currentUserInfo.userId, 
        p_like: reaction // We send the button clicked, RPC handles the toggle logic too
    });
    
    // 6. Sync with Real Database Data (Source of Truth)
    if(data && data[0]) { 
        setLiked(data[0].is_liked); 
        setTotalLikes(data[0].total_likes); 
        setTotalDislikes(data[0].total_dislikes); 
    } else if (error) {
        // Revert if error
        setLiked(oldLiked);
        setTotalLikes(oldTotalLikes);
        setTotalDislikes(oldTotalDislikes);
    }
  };

  const toggleSubscribe = async () => {
    if (!currentUserInfo.userId) return alert('Please login!');
    if (subscribed) await supabase.from('channel_subscriptions').delete().eq('user_id', currentUserInfo.userId).eq('channel_id', video.uploaded_by);
    else await supabase.from('channel_subscriptions').upsert({ user_id: currentUserInfo.userId, channel_id: video.uploaded_by, notify: false });
    setSubscribed(!subscribed);
    setSubscriberCount(prev => subscribed ? prev - 1 : prev + 1);
  };

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); };
  const handleClip = () => { alert("Clip feature coming soon!"); };
  const handleSave = () => { alert("Saved to playlist!"); };
  const handleReportVideo = () => { alert("Video Reported."); };
  const toggleNotify = () => { setNotify(!notify); alert(notify ? "Notifications Off" : "Notifications On"); };

  if (!video) return <div className="text-center text-white py-20">Loading...</div>;

  return (
    <div className="youtube-page">
      <div className="youtube-main-content">
        <div className="youtube-video-wrapper">
          <video ref={videoRef} key={videoId} className="youtube-video-element" controls poster={video.thumbUrl}>
            <source src={video.videoUrl} type="video/mp4" />
          </video>
        </div>

        <div className="youtube-video-info">
           <h1 className="youtube-title">{video.title}</h1>
           
           <div className="youtube-toolbar">
              <div className="youtube-channel-section">
                  <img src={channelInfo.avatar} className="youtube-channel-avatar" />
                  <div className="channel-text">
                    <span className="youtube-channel-name">{channelInfo.name}</span>
                    <span className="youtube-subscribers">{subscriberCount} subscribers</span>
                  </div>
                  <div className="subscribe-group">
                    <button className={`youtube-subscribe-btn ${subscribed?'subscribed':''}`} onClick={toggleSubscribe}>
                      {subscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                    {subscribed && (
                        <button className="youtube-bell-btn" onClick={toggleNotify}>
                            <Bell size={18} fill={notify ? "currentColor" : "none"} />
                        </button>
                    )}
                  </div>
              </div>

              {/* ACTION BUTTONS: Like, Share, Download, Clip, Save, Report */}
              <div className="youtube-actions-row">
                 <div className="like-dislike-group">
                    <button className={`tool-btn like-btn ${liked===true?'active':''}`} onClick={() => toggleReaction(true)}>
                        <ThumbsUp size={18} /> {totalLikes}
                    </button>
                    <div className="vertical-line"></div>
                    <button className={`tool-btn dislike-btn ${liked===false?'active':''}`} onClick={() => toggleReaction(false)}>
                        <ThumbsDown size={18} />
                    </button>
                 </div>
                 
                 <button className="tool-btn pill-btn" onClick={handleShare}><Share2 size={18} /> Share</button>
                 <button className="tool-btn pill-btn" onClick={() => { /* Download logic */ }}><Download size={18} /> Download</button>
                 <button className="tool-btn pill-btn" onClick={handleClip}><Scissors size={18} /> Clip</button>
                 <button className="tool-btn pill-btn" onClick={handleSave}><PlusSquare size={18} /> Save</button>
                 <button className="tool-btn circle-btn" onClick={handleReportVideo}><Flag size={18} /></button>
              </div>
           </div>

           {/* DESCRIPTION BOX WITH VIEWS & DATE */}
           <div className="youtube-description-box">
              <div className="desc-header">
                  <span className="view-count">{formatViews(totalViews)}</span>
                  <span className="upload-date">{new Date(video.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="desc-text">{video.description || 'No description provided.'}</div>
           </div>
        </div>

        {/* COMMENTS */}
        <div className="youtube-comments-section">
          <h2 className="youtube-comments-title">{comments.length} Comments</h2>
          <div className="youtube-add-comment">
            <img src={currentUserInfo.avatarUrl} className="youtube-comment-avatar" />
            <input type="text" className="youtube-comment-input" placeholder="Add a comment..."
              value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addRootComment()}
            />
            <button className="youtube-comment-submit" onClick={addRootComment} disabled={!commentText.trim()}>Comment</button>
          </div>
          <div className="youtube-comments-list">
            {comments.map(c => <CommentItem key={c.id} comment={c} currentUser={currentUserInfo} videoId={videoId} refreshComments={loadComments} />)}
          </div>
        </div>
      </div>

      <div className="youtube-sidebar">
         {recommendedVideos.map(rec => (
            <div key={rec.id} className="youtube-recommended-item" onClick={() => navigate(`/video/${rec.id}`)}>
               <img src={rec.thumbUrl} className="youtube-recommended-thumb" />
               <div className="youtube-recommended-title">{rec.title}</div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default VideoPlayer;