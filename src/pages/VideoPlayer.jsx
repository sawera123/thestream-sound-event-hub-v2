import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Save, MoreHorizontal, Zap } from 'lucide-react';
import { videosData } from '../data/videosData';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const video = videosData.find(v => v.id === parseInt(id));
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      text: 'Amazing content! Keep it up!',
      likes: 24,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      author: 'Sarah Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      text: 'This is exactly what I was looking for. Thanks!',
      likes: 15,
      timestamp: '5 hours ago'
    },
    {
      id: 3,
      author: 'Mike Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      text: 'Great quality video and explanation!',
      likes: 8,
      timestamp: '1 day ago'
    }
  ]);

  if (!video) {
    return (
      <div className="video-player-page">
        <div className="video-not-found">
          <h2>Video not found</h2>
          <button onClick={() => navigate('/videos')}>Back to Videos</button>
        </div>
      </div>
    );
  }

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
        text: commentText,
        likes: 0,
        timestamp: 'Just now'
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  return (
    <div className="video-player-page">
      <div className="video-player-container">
        <div className="video-player-main">
          <div className="video-player-wrapper">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="video-player-placeholder"
            />
            <div className="play-overlay">
              <div className="play-button-large">▶</div>
            </div>
          </div>

          <div className="video-info-section">
            <h1 className="video-player-title">{video.title}</h1>
            
            <div className="video-actions-bar">
              <div className="channel-info">
                <div className="channel-avatar">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${video.channel}`}
                    alt={video.channel}
                  />
                </div>
                <div className="channel-details">
                  <h3 className="channel-name">{video.channel}</h3>
                  <p className="channel-subscribers">2.5M subscribers</p>
                </div>
                <button 
                  className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
                  onClick={() => setIsSubscribed(!isSubscribed)}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              <div className="video-actions">
                <button 
                  className={`action-button ${liked ? 'active' : ''}`}
                  onClick={handleLike}
                >
                  <ThumbsUp size={20} fill={liked ? 'currentColor' : 'none'} />
                  <span>1.2K</span>
                </button>
                <button 
                  className={`action-button ${disliked ? 'active' : ''}`}
                  onClick={handleDislike}
                >
                  <ThumbsDown size={20} fill={disliked ? 'currentColor' : 'none'} />
                </button>
                <button className="action-button">
                  <Share2 size={20} />
                  <span>Share</span>
                </button>
                <button className="action-button">
                  <Save size={20} />
                  <span>Save</span>
                </button>
                <button className="action-button">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            <div className="video-description-box">
              <div className="video-stats">
                <span>{video.views} views</span>
                <span>•</span>
                <span>{video.uploadedAt}</span>
              </div>
              <p className="video-description">
                Experience premium content like never before. This video showcases 
                the best of {video.category.toLowerCase()} content with stunning 
                visuals and engaging storytelling. Subscribe to get access to more 
                exclusive content!
              </p>
            </div>
          </div>

          <div className="comments-section">
            <h2 className="comments-title">{comments.length} Comments</h2>
            
            <div className="add-comment">
              <div className="comment-avatar">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                  alt="Your avatar"
                />
              </div>
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <div className="comment-actions">
                  <button 
                    className="comment-cancel"
                    onClick={() => setCommentText('')}
                  >
                    Cancel
                  </button>
                  <button 
                    className="comment-submit"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>

            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    <img src={comment.avatar} alt={comment.author} />
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-timestamp">{comment.timestamp}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-footer">
                      <button className="comment-like">
                        <ThumbsUp size={16} />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="comment-like">
                        <ThumbsDown size={16} />
                      </button>
                      <button className="comment-reply">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="video-sidebar-recommendations">
          <div className="subscription-promo">
            <div className="promo-icon">
              <Zap size={32} fill="currentColor" />
            </div>
            <h3 className="promo-title">Unlock Premium Features</h3>
            <p className="promo-description">
              Upload unlimited videos, get HD quality, and access exclusive features
            </p>
            <button 
              className="promo-button"
              onClick={() => navigate('/subscription')}
            >
              View Plans
            </button>
          </div>

          <h3 className="recommendations-title">Recommended Videos</h3>
          <div className="recommended-videos">
            {videosData.filter(v => v.id !== video.id).slice(0, 8).map((v) => (
              <div 
                key={v.id} 
                className="recommended-video-card"
                onClick={() => navigate(`/video/${v.id}`)}
              >
                <img src={v.thumbnail} alt={v.title} className="recommended-thumbnail" />
                <div className="recommended-info">
                  <h4 className="recommended-title">{v.title}</h4>
                  <p className="recommended-channel">{v.channel}</p>
                  <p className="recommended-stats">
                    {v.views} views • {v.uploadedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
