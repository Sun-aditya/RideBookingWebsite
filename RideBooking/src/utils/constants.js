export const RIDE_TYPES = [
  { id: 1, name: "UberX", icon: "car", capacity: 4, eta: "3 mins", price: "₹120" },
  { id: 2, name: "Comfort", icon: "car", capacity: 4, eta: "5 mins", price: "₹180" },
  { id: 3, name: "XL", icon: "truck", capacity: 6, eta: "7 mins", price: "₹240" },
  { id: 4, name: "Black", icon: "car", capacity: 4, eta: "10 mins", price: "₹350" },
];

export const MOCK_DRIVER = {
  name: "Rajesh Kumar",
  rating: 4.8,
  car: "Swift Dzire",
  plate: "DL 01 AB 1234",
  avatar: "RK",
  phone: "+91 98765 43210",
};

export const MOCK_RIDES = [
  {
    id: 1,
    date: "Today, 9:30 AM",
    pickup: "Connaught Place",
    drop: "IGI Airport",
    fare: "₹450",
    status: "Completed",
    type: "UberX",
  },
  {
    id: 2,
    date: "Yesterday, 6:15 PM",
    pickup: "Lajpat Nagar",
    drop: "Cyber City",
    fare: "₹280",
    status: "Completed",
    type: "Comfort",
  },
  {
    id: 3,
    date: "Dec 28, 2:00 PM",
    pickup: "Hauz Khas",
    drop: "Saket Mall",
    fare: "₹150",
    status: "Cancelled",
    type: "UberX",
  },
];

export const QUICK_DESTINATIONS = ["Home", "Work", "Airport", "Mall"];

export const LOCATION_SUGGESTIONS = [
  "Connaught Place",
  "IGI Airport",
  "Cyber City",
  "Noida Sector 62",
  "Saket Mall",
  "India Gate",
];

export const PAYMENT_METHODS = ["Cash", "Card", "Wallet"];

export const PAYMENT_HISTORY = [
  { id: "p1", amount: "₹450", date: "Today", destination: "IGI Airport" },
  { id: "p2", amount: "₹280", date: "Yesterday", destination: "Cyber City" },
  { id: "p3", amount: "₹150", date: "Dec 28", destination: "Saket Mall" },
];

export const DRIVER_STATS = [
  { label: "Today's Earnings", value: "₹2,450" },
  { label: "Rides Completed", value: "12" },
  { label: "Hours Online", value: "7h 20m" },
  { label: "Rating", value: "4.9" },
];

export const DRIVER_RECENT_RIDES = [
  { id: "d1", rider: "Arjun", pickup: "Saket", drop: "Nehru Place", fare: "₹180" },
  { id: "d2", rider: "Priya", pickup: "CP", drop: "Karol Bagh", fare: "₹240" },
  { id: "d3", rider: "Mohit", pickup: "Vasant Kunj", drop: "Airport", fare: "₹320" },
];
