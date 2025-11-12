export const videosData = [
  {
    id: 1,
    title: "Advanced React Patterns and Best Practices 2024",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    channel: "Tech Masters",
    views: "2.4M",
    uploadedAt: "3 days ago",
    duration: "24:15",
    category: "Technology"
  },
  {
    id: 2,
    title: "Epic Gaming Moments - Live Tournament Highlights",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
    channel: "Gaming Zone",
    views: "1.8M",
    uploadedAt: "1 week ago",
    duration: "18:42",
    category: "Gaming"
  },
  {
    id: 3,
    title: "Cinematic Music Production Masterclass",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
    channel: "Sound Creators",
    views: "956K",
    uploadedAt: "2 days ago",
    duration: "32:18",
    category: "Music"
  },
  {
    id: 4,
    title: "Live Coding: Building a Full-Stack Application",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    channel: "Code Academy",
    views: "3.2M",
    uploadedAt: "5 hours ago",
    duration: "LIVE",
    category: "Live",
    isLive: true
  },
  {
    id: 5,
    title: "Travel Vlog: Exploring Hidden Gems Around the World",
    thumbnail: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400",
    channel: "Wanderlust TV",
    views: "4.1M",
    uploadedAt: "1 day ago",
    duration: "15:33",
    category: "Travel"
  },
  {
    id: 6,
    title: "Professional Photography Tips and Tricks",
    thumbnail: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400",
    channel: "Photo Pro",
    views: "1.5M",
    uploadedAt: "4 days ago",
    duration: "21:47",
    category: "Education"
  },
  {
    id: 7,
    title: "Morning Workout Routine for Maximum Results",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
    channel: "Fitness Hub",
    views: "2.9M",
    uploadedAt: "6 hours ago",
    duration: "12:20",
    category: "Sports"
  },
  {
    id: 8,
    title: "Cooking Masterclass: Italian Cuisine Secrets",
    thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400",
    channel: "Chef's Kitchen",
    views: "3.7M",
    uploadedAt: "2 weeks ago",
    duration: "28:55",
    category: "Food"
  }
];

export const trendingVideos = videosData.filter(v => parseInt(v.views) > 2000000);
export const liveVideos = videosData.filter(v => v.isLive);
