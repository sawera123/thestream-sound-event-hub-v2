// src/pages/Videos.jsx
import React, { useState, useEffect } from "react";
import VideoSidebar from "../components/video/VideoSidebar";
import VideoCard from "../components/video/VideoCard";
import { supabase } from "../lib/supabase";
import { Upload, Plus, Radio } from "lucide-react"; // <--- Radio Icon Added
import "./Videos.css";

const Videos = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [videoLinkToAdd, setVideoLinkToAdd] = useState("");
  const [manualAddError, setManualAddError] = useState(null);

  const [streamKey, setStreamKey] = useState(null); // Mux ka RTMP URL har stream ke liye same hota hai (replace 'live.mux.com')
  const [rtmpUrl, setRtmpUrl] = useState("rtmp://global-live.mux.com/app");
  const [playbackId, setPlaybackId] = useState(null);

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [historyVideoIds, setHistoryVideoIds] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [watchLaterIds, setWatchLaterIds] = useState([]);
  const [watchLaterLoading, setWatchLaterLoading] = useState(false);
  const [likedVideoIds, setLikedVideoIds] = useState([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  const [currentUserInfo, setCurrentUserInfo] = useState({
    fullName: "You",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    userId: null,
  });
  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!user || error) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const displayName =
        profile?.full_name?.trim() || user.email?.split("@")[0] || "User";
      const avatarUrl = profile?.avatar_url
        ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_url).data
            .publicUrl
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || "user"}`;

      setCurrentUserInfo({ fullName: displayName, avatarUrl, userId: user.id });
    };
    fetchUser();
  }, []);

  // Fetch videos
  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select(`*, profiles(full_name, avatar_url)`)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (!error && data) setVideos(data);
  };

  useEffect(() => {
    fetchVideos();
    const channel = supabase
      .channel("videos")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "videos" },
        (payload) => {
          if (payload.new.approved) {
            setVideos((prev) => [payload.new, ...prev]);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "videos" },
        async (payload) => {
          const { data: updatedVideo, error } = await supabase
            .from("videos")
            .select("*")
            .eq("id", payload.new.id)
            .maybeSingle();

          if (!error && updatedVideo?.approved) {
            setVideos((prev) => {
              const exists = prev.find((v) => v.id === updatedVideo.id);
              if (exists) {
                return prev.map((v) =>
                  v.id === updatedVideo.id ? updatedVideo : v,
                );
              } else {
                return [updatedVideo, ...prev];
              }
            });
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (activeCategory === "history" && currentUserInfo.userId) {
      const fetchHistoryIds = async () => {
        setHistoryLoading(true);
        // views table se user ki dekhi hui videos IDs aur unka 'last_watched' time fetch karein
        const { data: viewsData, error: viewsError } = await supabase
          .from("video_views")
          .select("video_id, last_watched")
          .eq("user_id", currentUserInfo.userId)
          .order("last_watched", { ascending: false }); // Latest watched first

        if (!viewsError && viewsData) {
          // IDs ko sort karke state mein store karein
          const sortedIds = viewsData.map((v) => v.video_id);
          setHistoryVideoIds(sortedIds);
        } else if (viewsError) {
          console.error("Error fetching history IDs:", viewsError);
        }
        setHistoryLoading(false);
      };
      fetchHistoryIds();
    } else if (activeCategory !== "history") {
      // Jab user history se bahar jaye, toh IDs ko clear kar dein.
      setHistoryVideoIds([]);
    }
  }, [activeCategory, currentUserInfo.userId]);

  useEffect(() => {
    if (activeCategory === "watchlater" && currentUserInfo.userId) {
      const fetchWatchLaterIds = async () => {
        setWatchLaterLoading(true);
        const { data: viewsData, error: viewsError } = await supabase
          .from("watch_later")
          .select("video_id")
          .eq("user_id", currentUserInfo.userId)
          .order("created_at", { ascending: false }); // Latest saved first

        if (!viewsError && viewsData) {
          const ids = viewsData.map((v) => v.video_id);
          setWatchLaterIds(ids);
        } else if (viewsError) {
          console.error("Error fetching watch later IDs:", viewsError);
        }
        setWatchLaterLoading(false);
      };
      fetchWatchLaterIds();
    } else if (activeCategory !== "watchlater") {
      setWatchLaterIds([]);
    }
  }, [activeCategory, currentUserInfo.userId]);

  useEffect(() => {
    if (activeCategory === "liked" || currentUserInfo.userId) {
      // Always fetch if user logged in, to check status
      const fetchLikedIds = async () => {
        setLikedLoading(true);
        const { data, error } = await supabase
          .from("video_likes")
          .select("video_id")
          .eq("user_id", currentUserInfo.userId)
          .eq("is_like", true) // <-- SIRF LIKED VIDEOS
          .order("created_at", { ascending: false });

        if (!error && data) {
          setLikedVideoIds(data.map((v) => v.video_id));
        } else if (error) {
          console.error("Error fetching liked IDs:", error);
        }
        setLikedLoading(false);
      };
      fetchLikedIds();
    } else if (!currentUserInfo.userId) {
      setLikedVideoIds([]);
    }
  }, [activeCategory, currentUserInfo.userId]);

  useEffect(() => {
    // Sirf tab sort karein jab user trending category mein ho ya videos update hui hon
    if (videos.length > 0) {
      setTrendingLoading(true);

      // 1. Approved videos ko filter karein
      const approvedVideos = videos.filter((v) => v.approved);

      // 2. Videos ki copy bana kar views ke adhaar par descending order mein sort karein
      const sorted = [...approvedVideos].sort(
        (a, b) => (b.view_count || 0) - (a.view_count || 0),
      );

      setTrendingVideos(sorted);
      setTrendingLoading(false);
    } else if (videos.length === 0) {
      setTrendingVideos([]);
    }
  }, [videos]);

  const filteredVideos =
    activeCategory === "all"
      ? videos.filter((v) => v.approved)
      : activeCategory === "trending"
        ? trendingLoading && trendingVideos.length === 0
          ? [] // Loading state
          : trendingVideos
        : activeCategory === "history"
          ? historyVideoIds.length > 0
            ? historyVideoIds
                .map((id) => videos.find((v) => v.id === id))
                .filter((v) => v && v.approved)
            : []
          : activeCategory === "watchlater" // <--- WATCH LATER FILTER
            ? watchLaterIds.length > 0
              ? watchLaterIds
                  // IDs ke order mein videos dhundhein
                  .map((id) => videos.find((v) => v.id === id))
                  .filter((v) => v && v.approved)
              : []
            : activeCategory === "liked"
              ? likedVideoIds.length > 0
                ? likedVideoIds
                    .map((id) => videos.find((v) => v.id === id))
                    .filter((v) => v && v.approved)
                : []
              : activeCategory.startsWith("channel_")
                ? videos.filter((v) => {
                    const channelId = activeCategory.split("_")[1];
                    return v.uploaded_by === channelId && v.approved;
                  })
                : // Normal Category Filtering
                  videos.filter(
                    (v) =>
                      v.category.toLowerCase() ===
                        activeCategory.toLowerCase() && v.approved,
                  );
  // --- Helper: generate auto thumbnail ---
  const generateThumbnail = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      video.addEventListener("loadeddata", () => {
        video.currentTime = 1;
      });
      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/png",
          1,
        );
      });
      video.addEventListener("error", (err) => reject(err));
    });
  };

  const isVideoInWatchLater = (videoId) => {
    return watchLaterIds.includes(videoId); // Check karein ki ID state mein hai ya nahi
  };

  const handleWatchLaterToggle = async (videoId, isSaved) => {
    if (!currentUserInfo.userId) {
      alert("Please log in to manage your Watch Later list.");
      return;
    }

    // Optimistic UI Update: Turant UI mein change dikhaane ke liye
    setWatchLaterIds(
      (prevIds) =>
        isSaved
          ? prevIds.filter((id) => id !== videoId) // Remove
          : [videoId, ...prevIds], // Add
    );

    const table = "watch_later";

    try {
      if (isSaved) {
        // REMOVE from DB
        await supabase
          .from(table)
          .delete()
          .eq("user_id", currentUserInfo.userId)
          .eq("video_id", videoId);
      } else {
        // ADD to DB
        await supabase
          .from(table)
          .insert({ user_id: currentUserInfo.userId, video_id: videoId });
      }
    } catch (err) {
      console.error("Watch Later DB Error:", err);
      alert(`Failed to ${isSaved ? "remove from" : "add to"} Watch Later.`);
      // Agar DB fail ho, toh UI ko wapas revert kar dein (Rollback)
      setWatchLaterIds((prevIds) =>
        isSaved
          ? [videoId, ...prevIds]
          : prevIds.filter((id) => id !== videoId),
      );
    }
  };

  const handleManualWatchLaterAdd = async (e) => {
    e.preventDefault();
    setManualAddError(null);

    if (!currentUserInfo.userId) {
      setManualAddError("Please log in to save videos.");
      return;
    }

    // Simple logic: Assuming user enters the video ID directly
    const videoId = parseInt(videoLinkToAdd.trim());

    if (isNaN(videoId) || videoId <= 0) {
      setManualAddError("Please enter a valid Video ID (e.g., 1, 15, 100).");
      return;
    }

    // Check if video exists (optional but recommended)
    const { count, error: countError } = await supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("id", videoId);

    if (countError || count === 0) {
      setManualAddError("Video not found with this ID.");
      return;
    }

    // Optimistic Update: Add to state first
    if (!watchLaterIds.includes(videoId)) {
      setWatchLaterIds((prev) => [videoId, ...prev]);
    }

    try {
      // Insert into database
      const { error } = await supabase
        .from("watch_later")
        .insert({ user_id: currentUserInfo.userId, video_id: videoId });

      if (error) throw error;

      setVideoLinkToAdd("");
      setShowManualAddModal(false);
      alert(`Video ID ${videoId} added to Watch Later!`);
    } catch (err) {
      console.error("Manual Add Error:", err);
      setManualAddError(err.message || "Failed to add video. Already added?");
      // Rollback optimistic update
      setWatchLaterIds((prev) => prev.filter((id) => id !== videoId));
    }
  };

  const isVideoLiked = (videoId) => {
    // Check karein ki video ID liked list mein hai ya nahi
    return likedVideoIds.includes(videoId);
  };

  const handleLikeToggle = async (videoId, isCurrentlyLiked) => {
    if (!currentUserInfo.userId) {
      alert("Please log in to like videos.");
      return;
    }

    // Optimistic UI Update:
    setLikedVideoIds(
      (prevIds) =>
        isCurrentlyLiked
          ? prevIds.filter((id) => id !== videoId) // Unlike (Remove)
          : [videoId, ...prevIds], // Like (Add)
    );

    try {
      if (isCurrentlyLiked) {
        // Option 1: Delete the row when unliked (Clean approach)
        const { error: deleteError } = await supabase
          .from("video_likes")
          .delete()
          .eq("user_id", currentUserInfo.userId)
          .eq("video_id", videoId);

        if (deleteError) throw deleteError;
      } else {
        // Option 2: Insert or Update to TRUE (Like)
        const { error: upsertError } = await supabase
          .from("video_likes")
          .upsert(
            {
              user_id: currentUserInfo.userId,
              video_id: videoId,
              is_like: true,
            },
            { onConflict: "user_id, video_id" }, // Unique constraint use karke
          );

        if (upsertError) throw upsertError;
      }
    } catch (err) {
      console.error("Like Toggle DB Error:", err);
      alert(`Failed to ${isCurrentlyLiked ? "unlike" : "like"} video.`);
      // Rollback optimistic update
      setLikedVideoIds((prevIds) =>
        isCurrentlyLiked
          ? [videoId, ...prevIds]
          : prevIds.filter((id) => id !== videoId),
      );
    }
  };
  // --- Functions to open Modal ---
  const openUploadModal = () => {
    setCategory("Technology"); // Default
    setShowUploadModal(true);
  };

  // src/pages/Videos.jsx

  const openLiveModal = async () => {
    if (!currentUserInfo.userId) {
      alert("Please log in to start a stream.");
      return;
    }
    setCategory("Live");
    setUploading(true);
    setTitle(""); // Ensure title is cleared/available for live stream metadata

    try {
      // Naye Edge Function ko call karein. Title bhi bhejte hain.
      const { data, error } = await supabase.functions.invoke(
        "create-mux-live-stream",
        {
          body: {
            user_id: currentUserInfo.userId,
            title: title || "Untitled Live Stream",
          },
        },
      );

      if (error) throw error;

      // Key aur Playback ID dono save karein
      setStreamKey(data.stream_key);
      setPlaybackId(data.playback_id); // Playback ID viewers ke liye zaroori hai
      // RTMP URL Mux ke server ka hota hai, jo hamesha 'rtmp://global-live.mux.com/app' hota hai,
      // ya hum Mux se received data.rtmp_url bhi use kar sakte hain
      setRtmpUrl(data.rtmp_url);
      setShowUploadModal(true);
    } catch (err) {
      console.error("Mux Creation Error:", err);
      alert("Failed to create Mux stream. Check Edge Function logs.");
    } finally {
      setUploading(false);
    }
  };

  // --- Handle Upload ---
  // --- Handle Upload (FINALIZED LOGIC) ---
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError("");

    try {
      // 1. Basic Auth Check
      const user = (await supabase.auth.getUser()).data.user;
      if (!user || !currentUserInfo.userId)
        throw new Error("User not authenticated");

      // --- 2. Check Input Requirements ---
      if (!title) {
        setUploadError("Title is required.");
        setUploading(false);
        return;
      }

      if (category !== "Live" && !videoFile) {
        setUploadError("Please select a video file for upload.");
        setUploading(false);
        return;
      }

      // 3. Define Shared Variables
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      const userIp = ipData.ip;

      let insertedRecord = null; // Variable to hold the final DB entry

      // =======================================================
      // A) LIVE STREAM START LOGIC
      // =======================================================
      if (category === "Live") {
        if (!streamKey || !playbackId)
          throw new Error("Mux assets not created. Try again."); // Playback ID check

        const { data, error } = await supabase
          .from("videos")
          .insert({
            title,
            description,
            category: "Live",
            video_url: playbackId, // Playback ID ko video_url mein store karein
            thumbnail_url: "videos_thumbnail/live_placeholder.png",
            uploaded_by: user.id,
            uploader_ip: userIp,
            status: "approved",
            stream_status: "waiting", // Initial status 'waiting' hona chahiye
          })
          .select()
          .single();

        if (error) throw error;
        insertedRecord = data;

        alert(
          `Stream entry created! Now start your OBS stream using the key: ${streamKey}`,
        );

        // =======================================================
        // B) NORMAL VIDEO UPLOAD LOGIC
        // =======================================================
      } else {
        // --- LIMIT CHECK (Normal Uploads ke liye) ---
        const { data: limitData, error: limitError } = await supabase.rpc(
          "check_upload_limits",
          {
            p_user_id: user.id,
            p_ip_address: userIp,
          },
        );
        if (limitError) throw limitError;
        const stats = limitData[0];
        console.log("--- USER UPLOAD STATS ---");
        console.log("Current Upload Count (24h):", stats.count);
        console.log("Is Premium/Subscribed:", stats.is_subscribed);
        console.log("Subscription Expiry Date:", stats.expiry_date);
        console.log("--------------------------");

        const currentUploadCount = parseInt(limitData[0]?.count || 0);
        const isSubscribed = limitData[0]?.is_subscribed || false;
        const FREE_LIMIT = 3;
        const PAID_LIMIT = 10;
        const userLimit = isSubscribed ? PAID_LIMIT : FREE_LIMIT;

        if (currentUploadCount >= userLimit) {
          setUploadError(
            `UPLOAD FAILED: Limit reached. You have uploaded ${currentUploadCount} of ${userLimit} free items. Please upgrade.`,
          );
          setUploading(false);
          return;
        }

        // 1. Upload video file
        const videoExt = videoFile.name.split(".").pop();
        const videoName = `${crypto.randomUUID()}.${videoExt}`;
        await supabase.storage
          .from("video")
          .upload(videoName, videoFile, { upsert: false });

        // 2. Handle thumbnail (use your existing logic)
        let thumbnailName = null;
        // ... (rest of thumbnail generation/upload logic) ...
        if (thumbnailFile) {
          // ... (your thumbnail upload code) ...
          const ext = thumbnailFile.name.split(".").pop();
          thumbnailName = `${crypto.randomUUID()}.${ext}`;
          await supabase.storage
            .from("thumbnails")
            .upload(`videos_thumbnail/${thumbnailName}`, thumbnailFile, {
              upsert: false,
            });
        } else {
          const blob = await generateThumbnail(videoFile);
          if (blob) {
            const fileName = `${crypto.randomUUID()}.png`;
            await supabase.storage
              .from("thumbnails")
              .upload(`videos_thumbnail/${fileName}`, blob, {
                contentType: "image/png",
              });
            thumbnailName = fileName;
          }
        }

        // 3. Insert into table (normal video)
        const { data, error: insertError } = await supabase
          .from("videos")
          .insert({
            title,
            description,
            category,
            video_url: videoName,
            thumbnail_url: `videos_thumbnail/${thumbnailName}`,
            uploaded_by: user.id,
            uploader_ip: userIp,
            status: "pending",
            stream_status: "finished",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        insertedRecord = data;
      }

      // 4. Final UI updates (Only update UI if a record was inserted)
      if (insertedRecord) {
        setVideos((prev) => [insertedRecord, ...prev]);
      }
      setShowUploadModal(false);
      setVideoFile(null);
      setThumbnailFile(null);
      setTitle("");
      setDescription("");
      setCategory("Technology");
    } catch (err) {
      console.error("Upload Error:", err);
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getChannelTitle = (activeCategory) => {
    // Expected format: 'channel_ID_NAME'
    if (activeCategory.startsWith("channel_")) {
      const parts = activeCategory.split("_");

      // Agar string mein ID aur Name dono hain (parts.length >= 3)
      if (parts.length > 2) {
        // Hum sirf Name (teesre part ya uske baad) ko lenge
        // Join '_', aur agar Name mein space tha, toh use replace karein (agar aapne VideoSidebar mein replace kiya tha)
        const namePart = parts.slice(2).join("_");
        const cleanName = namePart.replace(/~/g, " "); // Agar aapne '~' use kiya tha space ke liye

        return cleanName;
      }

      // Fallback agar sirf ID ho
      return "Channel Videos";
    }
    return "Videos"; // Default fallback
  };

  return (
    <div className="videos-page">
      <VideoSidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="videos-content">
        <div className="videos-header">
          <div>
            <h1 className="videos-title">
              {activeCategory === "all"
                ? "All Videos"
                : activeCategory.startsWith("channel_") // Check karein agar yeh channel filter hai
                  ? getChannelTitle(activeCategory) // <-- Naya Function Call
                  : activeCategory.charAt(0).toUpperCase() +
                    activeCategory.slice(1)}
            </h1>
            <p className="videos-subtitle">
              {filteredVideos.length} videos available
            </p>
          </div>

          {/* --- NEW BUTTONS SECTION --- */}
          <div style={{ display: "flex", gap: "12px" }}>
            {activeCategory === "watchlater" && currentUserInfo.userId && (
              <button
                className="manual-add-btn"
                onClick={() => {
                  setVideoLinkToAdd(""); // Clear previous input
                  setShowManualAddModal(true);
                }}
                style={{
                  // Thodi inline styling, aap CSS mein daal sakte hain
                  background: "#007bff",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={20} style={{ marginRight: 5 }} /> Add Video Manually
              </button>
            )}
            <button className="live-btn" onClick={openLiveModal}>
              <Radio size={20} /> Go Live
            </button>
            <button className="upload-btn" onClick={openUploadModal}>
              <Plus size={20} /> Upload Video
            </button>
          </div>
        </div>

        <div className="videos-grid">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={{
                ...video,
                videoUrl: supabase.storage
                  .from("video")
                  .getPublicUrl(video.video_url).data.publicUrl,
                thumbnailUrl: video.thumbnail_url
                  ? supabase.storage
                      .from("thumbnails")
                      .getPublicUrl(video.thumbnail_url).data.publicUrl
                  : "/default-thumbnail.jpg",
              }}
            />
          ))}
        </div>

        {showUploadModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowUploadModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">
                {category === "Live"
                  ? "Go Live (Upload Stream)"
                  : "Upload Video"}
              </h2>
              {uploadError && (
                <p className="text-red-500 text-center font-bold mb-4">
                  {uploadError}
                </p>
              )}

              <form onSubmit={handleUpload}>
                {category === "Live" && streamKey && (
                  <div className="stream-key-info p-4 bg-gray-700 rounded-lg mb-4 text-white">
                    <p className="font-bold text-lg mb-3">
                      Your Stream Details:
                    </p>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">RTMP Server URL:</span>
                      <code className="bg-gray-800 p-1 rounded text-green-400 select-all">
                        {rtmpUrl}
                      </code>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        Stream Key (Secret):
                      </span>
                      <code className="bg-gray-800 p-1 rounded text-red-400 select-all">
                        {streamKey}
                      </code>
                    </div>

                    <p className="text-sm mt-3 text-gray-400">
                      Copy these details into OBS/Streamlabs and start
                      streaming.
                    </p>
                  </div>
                )}

                {category !== "Live" && (
                  <>
                    <div className="upload-area">
                      <Upload size={48} className="upload-icon" />
                      <h3 className="upload-text">Select Video</h3>
                      <input
                        type="file"
                        className="file-input"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        required
                      />
                    </div>
                    <div className="upload-area">
                      <Upload size={48} className="upload-icon" />
                      <h3 className="upload-text">
                        Select Thumbnail (Optional)
                      </h3>
                      <input
                        type="file"
                        className="file-input"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files[0])}
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input"
                    placeholder="Enter video title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                    rows={4}
                    placeholder="Enter video description"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                  >
                    <option>Technology</option>
                    <option>Gaming</option>
                    <option>Music</option>
                    <option>Education</option>
                    <option>Entertainment</option>
                    <option>Movies</option>
                    <option>Live</option> {/* Live option included */}
                  </select>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-btn cancel"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-btn submit"
                    disabled={uploading}
                  >
                    {uploading
                      ? "Uploading..."
                      : category === "Live"
                        ? "Start Stream"
                        : "Upload Video"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showManualAddModal && (
          <div
            className="modal-overlay"
            // Cancel button ya overlay click hone par band karein
            onClick={() => setShowManualAddModal(false)}
          >
            <div
              className="modal-content"
              // Modal ke andar click hone par overlay click ko rokein
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="modal-title">Add Video to Watch Later</h2>
              {manualAddError && (
                <p className="text-red-500 text-center font-bold mb-4">
                  {manualAddError}
                </p>
              )}

              {/* Form submit hone par handleManualWatchLaterAdd function call hoga */}
              <form onSubmit={handleManualWatchLaterAdd}>
                <div className="form-group">
                  <label className="form-label">Video ID</label>
                  <input
                    type="text"
                    value={videoLinkToAdd}
                    onChange={(e) => setVideoLinkToAdd(e.target.value)}
                    className="form-input"
                    placeholder="Enter Video ID (e.g., 123)"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-btn cancel"
                    onClick={() => setShowManualAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="modal-btn submit">
                    Add to List
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Videos;
