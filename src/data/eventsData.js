export const eventsData = [
  {
    id: 1,
    title: "Tech Innovation Summit 2024",
    description: "Join industry leaders for groundbreaking discussions on AI, blockchain, and the future of technology.",
    poster: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
    date: "2024-02-15",
    time: "09:00 AM",
    venue: "Silicon Valley Convention Center",
    location: "San Jose, CA",
    category: "Technology",
    ticketPrice: 299,
    availableTickets: 450,
    totalCapacity: 500,
    organizer: "Tech Events Inc"
  },
  {
    id: 2,
    title: "Live Music Festival - Summer Beats",
    description: "Experience an unforgettable night with top international artists performing live on stage.",
    poster: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600",
    date: "2024-03-20",
    time: "06:00 PM",
    venue: "Central Park Arena",
    location: "New York, NY",
    category: "Music",
    ticketPrice: 89,
    availableTickets: 2500,
    totalCapacity: 5000,
    organizer: "Music Fest Productions"
  },
  {
    id: 3,
    title: "Startup Pitch Competition Finals",
    description: "Watch the best startups compete for $1M in funding. Network with investors and entrepreneurs.",
    poster: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600",
    date: "2024-02-28",
    time: "02:00 PM",
    venue: "Innovation Hub",
    location: "Austin, TX",
    category: "Business",
    ticketPrice: 149,
    availableTickets: 180,
    totalCapacity: 200,
    organizer: "Startup Accelerator"
  },
  {
    id: 4,
    title: "International Food & Wine Expo",
    description: "Taste cuisines from around the world and discover exceptional wines from renowned vineyards.",
    poster: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
    date: "2024-03-10",
    time: "11:00 AM",
    venue: "Grand Exhibition Hall",
    location: "Chicago, IL",
    category: "Food & Drink",
    ticketPrice: 75,
    availableTickets: 800,
    totalCapacity: 1000,
    organizer: "Culinary Events LLC"
  },
  {
    id: 5,
    title: "E-Sports Championship Grand Finals",
    description: "The ultimate showdown in competitive gaming. Watch top teams battle for the championship title.",
    poster: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600",
    date: "2024-04-05",
    time: "03:00 PM",
    venue: "Gaming Arena",
    location: "Los Angeles, CA",
    category: "Gaming",
    ticketPrice: 120,
    availableTickets: 1200,
    totalCapacity: 2000,
    organizer: "E-Sports League"
  },
  {
    id: 6,
    title: "Art & Design Expo 2024",
    description: "Explore contemporary art installations and innovative design concepts from global artists.",
    poster: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600",
    date: "2024-03-25",
    time: "10:00 AM",
    venue: "Modern Art Museum",
    location: "Miami, FL",
    category: "Art",
    ticketPrice: 45,
    availableTickets: 650,
    totalCapacity: 800,
    organizer: "Art Society"
  },
  {
    id: 7,
    title: "Blockchain & Crypto Conference",
    description: "Deep dive into cryptocurrency trends, DeFi, NFTs, and Web3 technologies with industry experts.",
    poster: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600",
    date: "2024-04-12",
    time: "09:30 AM",
    venue: "Tech Convention Center",
    location: "Seattle, WA",
    category: "Technology",
    ticketPrice: 399,
    availableTickets: 320,
    totalCapacity: 400,
    organizer: "Crypto Events Global"
  },
  {
    id: 8,
    title: "Comedy Night Live",
    description: "An evening filled with laughter featuring award-winning comedians and rising stars.",
    poster: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600",
    date: "2024-02-22",
    time: "08:00 PM",
    venue: "Comedy Club Downtown",
    location: "Boston, MA",
    category: "Entertainment",
    ticketPrice: 55,
    availableTickets: 150,
    totalCapacity: 200,
    organizer: "Laugh Factory Productions"
  }
];

export const resaleTickets = [
  {
    id: 1,
    eventId: 1,
    eventTitle: "Tech Innovation Summit 2024",
    originalPrice: 299,
    resalePrice: 249,
    seller: "John D.",
    quantity: 2,
    section: "VIP"
  },
  {
    id: 2,
    eventId: 2,
    eventTitle: "Live Music Festival - Summer Beats",
    originalPrice: 89,
    resalePrice: 95,
    seller: "Sarah M.",
    quantity: 1,
    section: "General Admission"
  },
  {
    id: 3,
    eventId: 5,
    eventTitle: "E-Sports Championship Grand Finals",
    originalPrice: 120,
    resalePrice: 110,
    seller: "Mike R.",
    quantity: 3,
    section: "Floor Seating"
  }
];

export const featuredAds = [
  {
    id: 1,
    title: "Super Bowl Weekend - Limited Tickets",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
    link: "/events/super-bowl",
    sponsor: "NFL Official"
  },
  {
    id: 2,
    title: "Broadway Shows - Spring Season",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800",
    link: "/events/broadway",
    sponsor: "Theater Alliance"
  },
  {
    id: 3,
    title: "Formula 1 Grand Prix Experience",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    link: "/events/f1-race",
    sponsor: "F1 Racing"
  }
];
