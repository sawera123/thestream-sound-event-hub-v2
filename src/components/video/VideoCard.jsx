import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Circle, Check, MoreVertical, ThumbsUp } from "lucide-react";
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
      <div className="video-thumbnail-wrapper" style={{ position: "relative" }}>
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="video-thumbnail"
        />

        {/* LIVE Badge: Isay hamesha Top-Left (Left: 10px) par rakhein */}
        {video.category === "Live" && (
          <span
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              backgroundColor: "#ff0000",
              color: "white",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              zIndex: 10,
            }}
          >
            <Circle size={6} fill="white" stroke="none" /> LIVE
          </span>
        )}

        {/* Buttons Group: Isay Top-Right (Right: 8px) par ek column mein rakhein */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 10,
          }}
        >
          {/* Like Button */}
          {onLikeToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeToggle(video.id, isLiked);
              }}
              style={{
                background: isLiked ? "#007bff" : "rgba(0,0,0,0.7)",
                color: "white",
                border: "none",
                padding: "5px",
                borderRadius: "4px",
              }}
            >
              <ThumbsUp size={16} />
            </button>
          )}

          {/* Watch Later Button */}
          {onWatchLaterToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWatchLaterToggle(video.id, isWatchLater);
              }}
              style={{
                background: isWatchLater ? "#ff0000" : "rgba(0,0,0,0.7)",
                color: "white",
                border: "none",
                padding: "5px",
                borderRadius: "4px",
              }}
            >
              {isWatchLater ? <Check size={16} /> : <Clock size={16} />}
            </button>
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
