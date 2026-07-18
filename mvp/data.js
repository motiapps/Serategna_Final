"use strict";
/**
 * Serategna MVP — demo dataset.
 * Phase 1 ships with mock data; a real backend replaces this file later.
 */

const CATEGORIES = [
  { id: "cleaning", label: "Cleaning", amharic: "ጽዳት", icon: "🧹" },
  { id: "plumbing", label: "Plumbing", amharic: "ቧንቧ", icon: "🔧" },
  { id: "electrical", label: "Electrical", amharic: "ኤሌክትሪክ", icon: "💡" },
  { id: "nanny", label: "Childcare", amharic: "ሞግዚት", icon: "🍼" },
  { id: "gardening", label: "Gardening", amharic: "አትክልት", icon: "🌿" },
  { id: "painting", label: "Painting", amharic: "ቀለም", icon: "🎨" },
  { id: "moving", label: "Moving", amharic: "ጭነት", icon: "📦" },
  { id: "tutoring", label: "Tutoring", amharic: "አስጠኚ", icon: "📚" },
];

const WORKERS = [
  {
    id: "w1", name: "Tigist Alemu", category: "cleaning", city: "Bole",
    rate: "ETB 450 / day", rating: 4.9, jobsDone: 132, years: 6, verified: true,
    phone: "+251911000001", color: "#1a7a4a",
    bio: "Thorough home and office cleaning. Brings her own supplies on request.",
  },
  {
    id: "w2", name: "Dawit Bekele", category: "plumbing", city: "Megenagna",
    rate: "ETB 700 / day", rating: 4.8, jobsDone: 98, years: 9, verified: true,
    phone: "+251911000002", color: "#2563ab",
    bio: "Licensed plumber. Repairs, installations, and emergency leak fixes.",
  },
  {
    id: "w3", name: "Hana Girma", category: "nanny", city: "CMC",
    rate: "ETB 500 / day", rating: 4.9, jobsDone: 60, years: 4, verified: false,
    phone: "+251911000003", color: "#b0468a",
    bio: "Patient and caring nanny for infants and toddlers. First-aid trained.",
  },
  {
    id: "w4", name: "Yonas Tesfaye", category: "electrical", city: "Piassa",
    rate: "ETB 750 / day", rating: 4.7, jobsDone: 110, years: 11, verified: true,
    phone: "+251911000004", color: "#a3611c",
    bio: "Certified electrician for wiring, sockets, breakers, and lighting.",
  },
  {
    id: "w5", name: "Meseret Abebe", category: "cleaning", city: "Gerji",
    rate: "ETB 400 / day", rating: 4.6, jobsDone: 75, years: 3, verified: false,
    phone: "+251911000005", color: "#6a41a8",
    bio: "Reliable weekly and one-time cleaning for apartments and villas.",
  },
  {
    id: "w6", name: "Bereket Haile", category: "painting", city: "Ayat",
    rate: "ETB 650 / day", rating: 4.8, jobsDone: 89, years: 7, verified: true,
    phone: "+251911000006", color: "#20808c",
    bio: "Interior and exterior painting with clean edges and tidy finishes.",
  },
  {
    id: "w7", name: "Selam Tadesse", category: "tutoring", city: "Kazanchis",
    rate: "ETB 350 / session", rating: 4.9, jobsDone: 210, years: 5, verified: true,
    phone: "+251911000007", color: "#1a7a4a",
    bio: "Maths and physics tutor for grades 6–12. Exam preparation a specialty.",
  },
  {
    id: "w8", name: "Samuel Getachew", category: "moving", city: "Saris",
    rate: "ETB 900 / day", rating: 4.5, jobsDone: 140, years: 8, verified: false,
    phone: "+251911000008", color: "#2563ab",
    bio: "Careful moving crew with a pickup truck. Packing help available.",
  },
  {
    id: "w9", name: "Eleni Mekonnen", category: "gardening", city: "Old Airport",
    rate: "ETB 480 / day", rating: 4.7, jobsDone: 52, years: 6, verified: false,
    phone: "+251911000009", color: "#4a7a1a",
    bio: "Garden design, pruning, and regular upkeep for homes and compounds.",
  },
  {
    id: "w10", name: "Girma Wolde", category: "electrical", city: "Summit",
    rate: "ETB 680 / day", rating: 4.6, jobsDone: 71, years: 10, verified: false,
    phone: "+251911000010", color: "#a3611c",
    bio: "Electrical maintenance and new installations, big or small.",
  },
  {
    id: "w11", name: "Marta Assefa", category: "nanny", city: "Sarbet",
    rate: "ETB 520 / day", rating: 4.8, jobsDone: 44, years: 5, verified: true,
    phone: "+251911000011", color: "#b0468a",
    bio: "Experienced with newborns. Happy to help with light housework too.",
  },
  {
    id: "w12", name: "Abel Fikru", category: "plumbing", city: "Lebu",
    rate: "ETB 600 / day", rating: 4.4, jobsDone: 38, years: 4, verified: false,
    phone: "+251911000012", color: "#20808c",
    bio: "Fast response for blocked drains, water tanks, and pipe repairs.",
  },
];

const JOBS = [
  {
    id: "j1", title: "Deep cleaning for a 3-bedroom house", category: "cleaning",
    location: "Bole", budget: "ETB 1,200", posted: "2 hours ago", phone: "+251922000001",
    description: "Full deep clean before a family event this weekend. Supplies provided.",
  },
  {
    id: "j2", title: "Fix a leaking kitchen sink", category: "plumbing",
    location: "CMC", budget: "ETB 800", posted: "5 hours ago", phone: "+251922000002",
    description: "Slow leak under the sink, needs a repair or part replacement.",
  },
  {
    id: "j3", title: "Weekend nanny for two kids", category: "nanny",
    location: "Gerji", budget: "ETB 600 / day", posted: "1 day ago", phone: "+251922000003",
    description: "Saturdays and Sundays, 8am–6pm. Kids are 3 and 6 years old.",
  },
  {
    id: "j4", title: "Rewire living room sockets", category: "electrical",
    location: "Piassa", budget: "ETB 1,500", posted: "1 day ago", phone: "+251922000004",
    description: "Four sockets not working after renovation; needs safe rewiring.",
  },
  {
    id: "j5", title: "Paint two bedrooms", category: "painting",
    location: "Ayat", budget: "ETB 4,000", posted: "2 days ago", phone: "+251922000005",
    description: "Walls and ceilings, light colors. Paint already purchased.",
  },
  {
    id: "j6", title: "Grade 8 maths tutor, twice a week", category: "tutoring",
    location: "Kazanchis", budget: "ETB 350 / session", posted: "3 days ago", phone: "+251922000006",
    description: "After-school sessions to prepare for ministry exams.",
  },
  {
    id: "j7", title: "Move furniture to a new apartment", category: "moving",
    location: "Bole → Summit", budget: "ETB 2,500", posted: "3 days ago", phone: "+251922000007",
    description: "One-bedroom apartment, third floor to ground floor. Truck needed.",
  },
];

/** Features that are visible in the UI but ship in a later phase. */
const SOON_FEATURES = [
  {
    id: "chat", icon: "💬", label: "In-app chat", phase: "Phase 2",
    description: "Message workers and employers directly, without sharing your phone number first.",
  },
  {
    id: "payments", icon: "🔒", label: "Secure payments", phase: "Phase 2",
    description: "Pay and get paid inside the app with escrow protection, via Telebirr and CBE Birr.",
  },
  {
    id: "verification", icon: "✅", label: "ID verification", phase: "Phase 2",
    description: "National ID (Fayda) based verification for every worker, so you always know who you hire.",
  },
  {
    id: "reviews", icon: "⭐", label: "Ratings & reviews", phase: "Phase 2",
    description: "Leave a rating and written review after every completed job. Today's ratings are sample data.",
  },
  {
    id: "amharic", icon: "🇪🇹", label: "አማርኛ interface", phase: "Phase 2",
    description: "Use the entire app in Amharic, with more Ethiopian languages to follow.",
  },
  {
    id: "maps", icon: "🗺️", label: "Map view", phase: "Phase 3",
    description: "See available workers and open jobs on a map around you.",
  },
  {
    id: "notifications", icon: "🔔", label: "Notifications", phase: "Phase 3",
    description: "Get alerted the moment a matching job or worker appears.",
  },
  {
    id: "saved", icon: "❤️", label: "Saved workers", phase: "Phase 3",
    description: "Keep a shortlist of your favorite workers for quick rehiring.",
  },
];
