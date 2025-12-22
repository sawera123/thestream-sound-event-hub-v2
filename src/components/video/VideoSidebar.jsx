import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- useEffect add hua
import { supabase } from "../../lib/supabase"; // <-- Supabase import hua
import {
  Home,
  TrendingUp,
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
  HelpCircle,
} from "lucide-react";
import "./VideoSidebar.css";

// Helper function to safely get avatar URL (VideoPlayer se copy kiya gaya)
// Taaki subscriptions mein profile picture dikhe
const getAvatarUrl = (url, name) => {
  if (url && typeof url === "string" && url.length > 5) return url;
  const safeName = name ? name.replace(/\s+/g, "+") : "User"; // Agar koi avatar URL na ho, toh UI Avatars se placeholder generate karein
  return `https://ui-avatars.com/api/?name=${safeName}&background=0D8ABC&color=fff&size=128&bold=true`;
};

const VideoSidebar = ({ activeCategory, onCategoryChange, onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  // --- Real Data States ---
  const [currentUser, setCurrentUser] = useState(null); // Current logged-in user
  const [subscriptions, setSubscriptions] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [watchLaterCount, setWatchLaterCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  // --- 1. Data Fetching Hook ---

  useEffect(() => {
    const fetchData = async (user) => {
      setLoading(true); // User ID confirm karein
      const userId = user
        ? user.id
        : (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        setCurrentUser(null);
        setSubscriptions([]);
        setLoading(false);
        return;
      }
      setCurrentUser({ id: userId }); // A) Fetch Subscriptions (Joins 'profiles' table to get channel name and avatar)

      const { count } = await supabase
        .from("video_views") // Views table se data lenge
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // --- FETCH WATCH LATER COUNT ---
      const { count: wlCnt } = await supabase
        .from("watch_later")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      setWatchLaterCount(wlCnt || 0);

      // --- FETCH LIKED COUNT ---
      const { count: likeCnt } = await supabase
        .from("video_likes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_like", true); // Sirf liked (TRUE) count karein
      setLikedCount(likeCnt || 0);

      setHistoryCount(count || 0);

      const { data: subs, error: subError } = await supabase
        .from("channel_subscriptions")
        .select(
          `
  channel_id,
  profiles!channel_subscriptions_channel_id_fkey (full_name, avatar_url)
  `,
        )
        .eq("user_id", userId);
      if (!subError && subs) {
        const formattedSubs = subs.map((sub) => {
          const profile = sub.profiles;
          const name = profile?.full_name || "Channel";
          return {
            id: sub.channel_id,
            name: name,
            avatarUrl: getAvatarUrl(profile?.avatar_url, name),
          };
        });
        setSubscriptions(formattedSubs);
      } else if (subError) {
        console.error("Error fetching subscriptions:", subError);
      }
      setLoading(false);
    }; // Auth state change listener lagayein taaki login/logout par list update ho

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchData(session.user); // Login par refresh karein
        } else {
          setCurrentUser(null);
          setSubscriptions([]);
        }
      },
    ); // Initial load
    fetchData(null);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Toggle collapse and notify parent

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    if (onCollapse) onCollapse(!collapsed);
  }; // --- Categories (Fake data ki jagah) ---

  const categories = [
    { id: "all", icon: Home, label: "Home" },
    { id: "trending", icon: TrendingUp, label: "Most Watched" },
    // { id: "music", icon: Music, label: "Music" },
    { id: "live", icon: Radio, label: "Live" },
    { id: "history", icon: Clock, label: `History (${historyCount})` },
    {
      id: "watchlater",
      icon: Bookmark,
      label: `Watch Later (${watchLaterCount})`,
    },
    { id: "liked", icon: ThumbsUp, label: `Liked Videos (${likedCount})` },
  ];

  // const bottomItems = [
  //   { id: "settings", icon: Settings, label: "Settings" },
  //   { id: "help", icon: HelpCircle, label: "Help" },
  // ];
  return (
    <aside className={`video-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Collapse Button */}  {/* Collapse Button */}
      <button className="collapse-btn" onClick={toggleCollapse}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24" /* fixed width */
          height="24" /* fixed height */
          fill="white" /* white color */
          style={{
            pointerEvents: "none",
            display: "block",
            margin: "0 auto" /* center horizontally */,
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
        {/* SUBSCRIPTIONS SECTION (Show only if user is logged in) */} 
        {currentUser && (
          <>
         
            <div className="section-title">
              {!collapsed && <span>Subscriptions</span>} 
             
            </div>
           
            {loading ? (
              <p className="loading-text">{!collapsed && "Loading..."}</p>
            ) : subscriptions.length > 0 ? (
              // --- 2. Real Subscriptions Render Karein ---
              subscriptions.map((sub) => (
                <button
                  key={sub.id}
                  className="sidebar-item subscription-item"
                  onClick={() =>
                    onCategoryChange(
                      `channel_${sub.id}_${sub.name.replace(/\s+/g, "~")}`,
                    )
                  }
                >
                  {/* Avatar URL display karein */} 
                 
                  <img
                    src={sub.avatarUrl}
                    alt={sub.name}
                    className="subscription-avatar"
                  />
                  {!collapsed && <span>{sub.name}</span>}
                 
                </button>
              ))
            ) : (
              <p className="empty-text">
                {!collapsed && "No subscriptions yet"}
              </p>
            )}
            <hr /> 
          </>
        )}
        {/* SETTINGS & HELP */} 
        {/* {bottomItems.map((item) => (
          <button key={item.id} className="sidebar-item">
            <item.icon size={22} /> 
            {!collapsed && <span>{item.label}</span>} 

          </button>
        ))} */}
       
      </div>
     
    </aside>
  );
};

export default VideoSidebar;
