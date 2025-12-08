import React, { useState } from "react";
import {
  Home,
  TrendingUp,
  Music,
  Gamepad,
  Radio,
  Clock,
  ThumbsUp,
  Film,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  User,
  Settings,
  HelpCircle
} from "lucide-react";
import "./VideoSidebar.css";

const VideoSidebar = ({ activeCategory, onCategoryChange, onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);

  const categories = [
    { id: "all", icon: Home, label: "Home" },
    { id: "trending", icon: TrendingUp, label: "Trending" },
    { id: "music", icon: Music, label: "Music" },
    { id: "live", icon: Radio, label: "Live" },
    { id: "mostwatched", icon: Film, label: "Most Watched" },
    { id: "history", icon: Clock, label: "History" },
    { id: "watchlater", icon: Bookmark, label: "Watch Later" },
    { id: "liked", icon: ThumbsUp, label: "Liked Videos" },
   
  ];

  const subscriptions = [
    { id: 1, name: "Tech Zone", icon: User },
    { id: 2, name: "Daily Coding", icon: User },
    { id: 3, name: "Music Beats", icon: User },
    { id: 4, name: "Gaming Pro", icon: User }
  ];

  // Toggle collapse and notify parent
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    if (onCollapse) onCollapse(!collapsed);
  };
   
  const bottomItems = [
    { id: "settings", icon: Settings, label: "Settings" },
    { id: "help", icon: HelpCircle, label: "Help" }
  ];
  return (
    <aside className={`video-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Collapse Button */}
   <button className="collapse-btn" onClick={toggleCollapse}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"  /* fixed width */
    height="24" /* fixed height */
    fill="white" /* white color */
    style={{
      pointerEvents: "none",
      display: "block",
      margin: "0 auto" /* center horizontally */
    }}
  >
    <path d="M20 5H4a1 1 0 000 2h16a1 1 0 100-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Z"></path>
  </svg>
</button>


      <div className="sidebar-content">
        {/* MAIN CATEGORIES */}
        {categories.map((category) => (
          <button
            key={category.id}
            className={`sidebar-item ${activeCategory === category.id ? "active" : ""}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <category.icon size={22} />
            {!collapsed && <span>{category.label}</span>}
          </button>
        ))}

        <hr />

        {/* SUBSCRIPTIONS SECTION */}
        <div className="section-title">
          {!collapsed && <span>Subscriptions</span>}
        </div>

        {subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <button key={sub.id} className="sidebar-item">
              <sub.icon size={22} />
              {!collapsed && <span>{sub.name}</span>}
            </button>
          ))
        ) : (
          <p className="empty-text">
            {!collapsed && "No subscriptions yet"}
          </p>
        )}
        <hr />
        {/* SETTINGS & HELP */}
        {bottomItems.map(item => (
          <button key={item.id} className="sidebar-item">
            <item.icon size={22} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default VideoSidebar;
