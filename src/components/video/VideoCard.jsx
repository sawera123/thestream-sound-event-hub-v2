import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Circle, Check, MoreVertical } from "lucide-react";
import "./VideoCard.css";

const VideoCard = ({
  video,
  onWatchLaterToggle,
  isWatchLater,
  onLikeToggle, // <-- NEW PROP 1
  isLiked,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="video-card hover-lift"
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <div className="video-thumbnail-wrapper">
        <img
          src={video.thumbnailUrl} // already prepared in Videos.jsx
          alt={video.title}
          className="video-thumbnail"
        />

        {onLikeToggle && (
          <button
            className={`like-btn ${isLiked ? "active" : ""}`}
            onClickCapture={(e) => {
              // Capture Fix
              e.stopPropagation();
              e.preventDefault();
              onLikeToggle(video.id, isLiked);
            }}
            title={isLiked ? "Unlike this video" : "Like this video"}
            style={{
              position: "absolute",
              top: 8,
              right: 8, // Right most position
              background: isLiked ? "#007bff" : "rgba(0, 0, 0, 0.8)", // Blue for liked
              color: "white",
              border: "none",
              padding: "4px 6px",
              borderRadius: 4,
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <ThumbsUp size={16} style={{ pointerEvents: "none" }} />
          </button>
        )}

        {onWatchLaterToggle && (
          <button
            className={`watch-later-btn ${isWatchLater ? "saved" : ""}`}
            onClickCapture={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onWatchLaterToggle(video.id, isWatchLater);
            }}
            title={
              isWatchLater ? "Remove from Watch Later" : "Save to Watch Later"
            }
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: isWatchLater ? "#FF0000" : "rgba(0, 0, 0, 0.8)",
              color: "white",
              border: "none",
              padding: "4px 6px",
              borderRadius: 4,
              cursor: "pointer",
              zIndex: 10,
            }}
          >
                                   {" "}
            {isWatchLater ? (
              <Check size={16} style={{ pointerEvents: "none" }} />
            ) : (
              <Clock size={16} style={{ pointerEvents: "none" }} />
            )}
                                 {" "}
          </button>
        )}

        <div className="video-duration">
          {video.isLive ? (
            <span className="live-badge">
              <Circle className="live-dot" size={8} fill="currentColor" />
              LIVE
            </span>
          ) : (
            <span className="duration-badge">
              <Clock size={12} />
              {video.duration || "N/A"}
            </span>
          )}
        </div>
      </div>

      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-channel">{video.category}</p>
      </div>
    </div>
  );
};

export default VideoCard;
