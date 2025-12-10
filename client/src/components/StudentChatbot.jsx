import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, MapPin, Phone, Mail, Navigation, ArrowRight, Download, Trash2, Search, Map } from "lucide-react";
// Make sure to import your map image correctly
import mapImage from "../assets/map.jpeg"; // Adjust path based on your project structure

// Enhanced Student Chatbot Component
export default function StudentChatbot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryKey = 'student-chat-history';

  // Load chat history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(chatHistoryKey);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed);
      } catch (e) {
        initializeChat();
      }
    } else {
      initializeChat();
    }
  }, []);

  const initializeChat = () => {
    setMessages([
      {
        type: 'bot',
        text: "👋 Hi Student! I'm Shafik . I know a lot about GUC, till I hopefully graduate, I can help you with:",
        timestamp: new Date().toISOString(),
        quickActions: [
          { label: "Browse Events", section: "events", tab: "upcoming" },
          { label: "My Registrations", section: "events", tab: "registered" },
          { label: "Manage Favorites", section: "events", tab: "favorites" },
          { label: "Gym Schedule", section: "gymSchedule" },
          { label: "Book Court Slots", section: "courts" }
        ],
        mapAction: { label: "View Campus Map", section: "map" }
      }
    ]);
  };

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const knowledgeBase = {
    "browse events": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Go to the 'Upcoming Events' tab",
        "3. Browse all available events:",
        "   • Workshops and seminars",
        "   • Trips and excursions",
        "   • Bazaars and fairs",
        "   • Conferences",
        "4. Use the search and filter tools:",
        "   • Search by event title or keywords",
        "   • Filter by event type",
        "   • Filter by location",
        "   • Filter by specific date",
        "   • Sort by earliest or latest first",
        "5. Click on any event card to see full details",
        "6. Add events to favorites by clicking the heart icon",
        "7. Click 'Register' to sign up for events"
      ],
      quickActions: [
        { label: "Go to Events", section: "events", tab: "upcoming" },
        { label: "Search Events", section: "events", tab: "search" }
      ],
      keywords: ["browse", "events", "upcoming", "find events"]
    },
    "register for events": {
      steps: [
        "1. Navigate to 'Events' section",
        "2. Find the event you want to attend",
        "3. Click on the event card to view details:",
        "   • Event description and schedule",
        "   • Location and requirements",
        "   • Price (if any)",
        "   • Available spots",
        "4. Click the 'Register' button",
        "5. Fill in the registration form:",
        "   • Confirm your details",
        "   • Provide any required information",
        "   • Accept terms and conditions",
        "6. Submit your registration",
        "7. If payment is required, complete the payment",
        "8. You'll receive a confirmation",
        "9. Check 'My Registrations' to track status"
      ],
      quickActions: [
        { label: "View Events", section: "events", tab: "upcoming" },
        { label: "My Registrations", section: "events", tab: "registered" }
      ],
      keywords: ["register", "sign up", "enroll", "join event"]
    },
    "manage favorites": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. To add events to favorites:",
        "   • Browse 'Upcoming Events' tab",
        "   • Click the heart icon on any event card",
        "   • Event is instantly saved to favorites",
        "3. To view your favorites:",
        "   • Click the 'Favorites' tab",
        "   • See all your saved events in one place",
        "4. To remove from favorites:",
        "   • Click the heart icon again",
        "   • Event is removed from favorites",
        "5. Benefits of favorites:",
        "   • Quick access to events you're interested in",
        "   • Never lose track of important events",
        "   • Easy comparison between events"
      ],
      quickActions: [
        { label: "View Favorites", section: "events", tab: "favorites" }
      ],
      keywords: ["favorites", "saved", "bookmark", "heart"]
    },
    "book court slots": {
      steps: [
        "1. Click on 'View Courts' in the sidebar",
        "2. You'll see all available campus courts:",
        "   • Basketball courts",
        "   • Tennis courts",
        "   • Football fields",
        "   • Other sports facilities",
        "3. Click on any court to view its availability",
        "4. Browse available time slots by date:",
        "   • Green/available slots can be booked",
        "   • Gray/booked slots show who reserved them",
        "5. To book a slot:",
        "   • Click on an available (green) time slot",
        "   • Confirm your booking details",
        "   • Booking is instant!",
        "6. Your booking will show:",
        "   • Your name and GUC ID",
        "   • Reserved date and time",
        "7. Note: You can only book available slots"
      ],
      quickActions: [
        { label: "Book Courts", section: "courts" }
      ],
      keywords: ["court", "book", "reserve", "sports", "slots"]
    },
    "check gym schedule": {
      steps: [
        "1. Click on 'Gym Schedule' in the sidebar",
        "2. View the complete weekly gym schedule:",
        "   • All gym sessions by day and time",
        "   • Session types (Cardio, Strength, Yoga, etc.)",
        "   • Instructor names",
        "   • Session capacity",
        "3. See which sessions are:",
        "   • Currently available for registration",
        "   • Fully booked",
        "   • Upcoming this week",
        "4. To register for a gym session:",
        "   • Find a session with available spots",
        "   • Click 'Register' or 'Book'",
        "   • Confirm your registration",
        "5. Check your registered sessions",
        "6. Plan your gym routine around the schedule"
      ],
      quickActions: [
        { label: "Gym Schedule", section: "gymSchedule" }
      ],
      keywords: ["gym", "schedule", "fitness", "workout"]
    },
    "vote on booths": {
      steps: [
        "1. Click on 'Booth Polls' in the sidebar",
        "2. Browse active vendor booth polls",
        "3. For each booth you can see:",
        "   • Vendor company name",
        "   • Products or services they offer",
        "   • Booth description and benefits",
        "   • Photos or promotional materials",
        "4. To cast your vote:",
        "   • Read about what the booth offers",
        "   • Click the 'Vote' button",
        "   • Your vote is recorded",
        "5. Why voting matters:",
        "   • Helps select popular vendors",
        "   • Influences which booths appear at bazaars",
        "   • Gets you the vendors you want to see",
        "6. You can vote for multiple booths",
        "7. Results help event officers plan better"
      ],
      quickActions: [
        { label: "Booth Polls", section: "boothPolls" }
      ],
      keywords: ["vote", "booth", "poll", "vendor"]
    },
    "view loyalty vendors": {
      steps: [
        "1. Click on 'Loyalty Vendors' in the sidebar",
        "2. Browse all vendors with loyalty programs",
        "3. For each vendor you'll see:",
        "   • Company name and logo",
        "   • Business description",
        "   • Loyalty program benefits",
        "   • Points system details",
        "   • Special offers and discounts",
        "4. To join a loyalty program:",
        "   • Click on the vendor",
        "   • Review program terms",
        "   • Click 'Join Program'",
        "   • Start earning rewards!",
        "5. Benefits include:",
        "   • Exclusive student discounts",
        "   • Points on purchases",
        "   • Special promotions",
        "   • Early access to sales",
        "6. Track your rewards in the vendor portal"
      ],
      quickActions: [
        { label: "Loyalty Vendors", section: "loyaltyVendors" }
      ],
      keywords: ["loyalty", "vendors", "rewards", "discounts"]
    },
    "review events": {
      steps: [
        "1. To see all reviews:",
        "   • Click 'Events Reviews' in the sidebar",
        "   • Browse reviews from all students and professors",
        "2. To review an event you attended:",
        "   • Go to 'Events' section",
        "   • Click 'Attended Events' tab",
        "   • Find the event you want to review",
        "3. Click 'Write Review' or 'Rate Event'",
        "4. Provide your feedback:",
        "   • Rate the event (1-5 stars)",
        "   • Write detailed comments",
        "   • Share what you liked or didn't like",
        "   • Suggest improvements",
        "5. Submit your review",
        "6. Your feedback helps:",
        "   • Other students make decisions",
        "   • Event officers improve future events",
        "   • Professors plan better workshops",
        "7. Be honest and constructive!"
      ],
      quickActions: [
        { label: "Events Reviews", section: "eventsReviews" },
        { label: "Attended Events", section: "events", tab: "attended" }
      ],
      keywords: ["review", "rate", "feedback", "comments"]
    },
    "my registrations": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Go to 'My Registrations' tab",
        "3. See all events you've registered for:",
        "   • Upcoming events you'll attend",
        "   • Registration status (Pending/Confirmed)",
        "   • Payment status (Paid/Pending)",
        "   • Event dates and times",
        "4. For each registration you can:",
        "   • View full event details",
        "   • Check payment status",
        "   • Make payment if required",
        "   • Cancel registration (if allowed)",
        "5. Payment options:",
        "   • Some events are free",
        "   • Others require payment",
        "   • Pay online through the portal",
        "6. Keep track of all your commitments",
        "7. Get reminders before events"
      ],
      quickActions: [
        { label: "My Registrations", section: "events", tab: "registered" }
      ],
      keywords: ["registrations", "my events", "signed up"]
    },
    "attended events": {
      steps: [
        "1. Click on 'Events' section",
        "2. Navigate to 'Attended Events' tab",
        "3. See all past events you've attended",
        "4. For each attended event:",
        "   • View event details and photos",
        "   • See who else attended",
        "   • Check if you received credit/points",
        "   • Leave a rating and review",
        "5. To rate an event:",
        "   • Click 'Rate Event'",
        "   • Give 1-5 stars",
        "   • Write optional comments",
        "   • Share your experience",
        "6. Build your event history",
        "7. Track your campus engagement"
      ],
      quickActions: [
        { label: "Attended Events", section: "events", tab: "attended" }
      ],
      keywords: ["attended", "past events", "history"]
    },
    "available booths": {
      steps: [
        "1. Click on 'Available Booths' in the sidebar",
        "2. Browse all vendor booths at upcoming bazaars",
        "3. Information shown for each booth:",
        "   • Vendor company name",
        "   • Products or services",
        "   • Booth location at venue",
        "   • Booth size (2x2 or 4x4)",
        "   • Bazaar event date and time",
        "4. Use this to:",
        "   • Plan which booths to visit",
        "   • Find specific products you need",
        "   • Discover new vendors",
        "   • Map out your bazaar route",
        "5. Filter booths by:",
        "   • Product category",
        "   • Vendor name",
        "   • Bazaar event",
        "6. This is informational only for students",
        "7. Visit booths during bazaar events"
      ],
      quickActions: [
        { label: "Available Booths", section: "availableBooths" }
      ],
      keywords: ["booths", "vendors", "bazaar"]
    },
    "events reviews": {
      steps: [
        "1. Click 'Events Reviews' in the sidebar",
        "2. Browse all event reviews from the community",
        "3. You'll see:",
        "   • Overall event ratings",
        "   • Detailed reviews and comments",
        "   • Photos from attendees",
        "   • Pros and cons mentioned",
        "4. Filter reviews by:",
        "   • Event type",
        "   • Rating (5 stars, 4 stars, etc.)",
        "   • Most recent or most helpful",
        "5. Use reviews to:",
        "   • Decide which events to attend",
        "   • Learn from others' experiences",
        "   • Find the best workshops",
        "   • Avoid poorly organized events",
        "6. Add your own reviews after attending",
        "7. Help the community make better choices"
      ],
      quickActions: [
        { label: "Events Reviews", section: "eventsReviews" }
      ],
      keywords: ["reviews", "ratings", "feedback"]
    },
    "view campus map": {
      map: true,
      contactInfo: {
        location: "German University in Cairo (GUC)\n5th Settlement, New Cairo City\nCairo, Egypt",
        hotline: "+20 2 27589990",
        email: "info@guc.edu.eg",
        gates: [
          "🚪 **Gate 1**: Main entrance for students and visitors",
          "🚪 **Gate 3**: Secondary entrance near faculty buildings",
          "🚪 **Gate 4**: Entrance close to Parking and Registration Building",
          "🅿️ **Gate 5**: Parking entrance only"
        ]
      },
      keywords: ["map", "campus", "location", "address", "directions"]
    },
    "campus location": {
      map: true,
      contactInfo: {
        location: "German University in Cairo (GUC)\n5th Settlement, New Cairo City\nCairo, Egypt",
        hotline: "+20 2 27589990",
        email: "info@guc.edu.eg",
        gates: [
          "🚪 **Gate 1**: Main entrance for students and visitors",
          "🚪 **Gate 3**: Secondary entrance near faculty buildings",
          "🚪 **Gate 4**: Entrance close to Parking and Registration Building",
          "🅿️ **Gate 5**: Parking entrance only"
        ]
      },
      keywords: ["location", "address", "where", "directions"]
    }
  };

  const findBestMatch = (text) => {
    const lowerText = text.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    Object.entries(knowledgeBase).forEach(([key, value]) => {
      let score = 0;
      
      if (lowerText.includes(key)) score += 10;
      
      value.keywords?.forEach(keyword => {
        if (lowerText.includes(keyword)) score += 5;
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = { key, ...value };
      }
    });

    return highestScore > 0 ? bestMatch : null;
  };

  const handleSendMessage = (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = {
      type: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const match = findBestMatch(text);

      if (match) {
        if (match.map) {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: "Here's the campus map and location information:",
            map: true,
            contactInfo: match.contactInfo,
            timestamp: new Date().toISOString(),
            quickActions: [
              { label: "Events", section: "events", tab: "upcoming" },
              { label: "Gym Schedule", section: "gymSchedule" },
              { label: "Booth Polls", section: "boothPolls" }
            ]
          }]);
        } else {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: "Here are the steps:",
            steps: match.steps,
            quickActions: match.quickActions,
            timestamp: new Date().toISOString()
          }]);
        }
      } else if (text.toLowerCase().includes('help') || text.toLowerCase().includes('hi') || text.toLowerCase().includes('hello')) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm here to help! Here's what I can assist you with:",
          quickActions: [
            { label: "Browse Events", section: "events", tab: "upcoming" },
            { label: "My Registrations", section: "events", tab: "registered" },
            { label: "Manage Favorites", section: "events", tab: "favorites" },
            { label: "Book Courts", section: "courts" },
            { label: "Gym Schedule", section: "gymSchedule" }
          ],
          mapAction: { label: "View Campus Map", section: "map" },
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Try asking about:\n• Events and registration\n• Campus facilities\n• Gym schedule\n• Booth voting\n• Loyalty vendors\n\nOr use the search feature to find what you need!",
          timestamp: new Date().toISOString(),
          quickActions: [
            { label: "Browse Help Topics", action: "help" }
          ]
        }]);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (action) => {
    if (onNavigate) {
      onNavigate(action.section, action.tab);
    }
    
    if (action.action === "help") {
      handleSendMessage("help");
      return;
    }
    
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `✓ Taking you to ${action.label}...`,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleMapAction = () => {
    handleSendMessage("view campus map");
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString();
      const sender = msg.type === 'user' ? 'You' : 'Campus Assistant';
      let content = `[${time}] ${sender}: ${msg.text}`;
      
      if (msg.steps) {
        content += '\n' + msg.steps.join('\n');
      }
      
      if (msg.map) {
        content += '\n[Map and Contact Information]';
      }
      
      return content;
    }).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearChat = () => {
    localStorage.removeItem(chatHistoryKey);
    initializeChat();
  };

  const searchInKnowledgeBase = () => {
    const query = searchQuery.toLowerCase();
    const results = [];

    Object.entries(knowledgeBase).forEach(([key, value]) => {
      if (key.includes(query) || value.keywords?.some(k => k.includes(query))) {
        results.push({ key, ...value });
      }
    });

    setShowSearch(false);
    setSearchQuery('');

    if (results.length > 0) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `Found ${results.length} result(s) for "${searchQuery}":`,
        searchResults: results.map(r => ({
          label: r.key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          query: r.key
        })),
        timestamp: new Date().toISOString()
      }]);
    } else {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `No results found for "${searchQuery}". Try different keywords!`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <>
      {/* Chat Button */}
<button
  onClick={() => setIsOpen(!isOpen)}
  className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center z-50 group ${
    isOpen ? 'scale-0' : 'scale-100'
  }`}
>
  <img 
    src="/src/assets/shafik.png" 
    alt="Chat Assistant" 
    className="w-15 h-15 rounded-full object-cover group-hover:scale-110 transition-transform border-2 border-white"
  />
  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
</button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
  {/* Header */}
  <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Replace Sparkles icon with your image */}
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
        <img 
          src="/src/assets/shafik.png" 
          alt="Assistant Avatar" 
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className="font-semibold text-white">Campus Assistant</h3>
        <p className="text-xs text-teal-100">(App. Num: 1-2333)😊</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="text-white hover:bg-white/20 rounded-full p-2 transition"
        title="Search Knowledge Base"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        onClick={handleExportChat}
        className="text-white hover:bg-white/20 rounded-full p-2 transition"
        title="Export Chat"
      >
        <Download className="w-4 h-4" />
      </button>
      <button
        onClick={handleClearChat}
        className="text-white hover:bg-white/20 rounded-full p-2 transition"
        title="Clear Chat"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => setIsOpen(false)}
        className="text-white hover:bg-white/20 rounded-full p-2 transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="p-3 bg-teal-50 border-b border-teal-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchInKnowledgeBase()}
                  placeholder="Search knowledge base..."
                  className="flex-1 border border-teal-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <button
                  onClick={searchInKnowledgeBase}
                  className="bg-green-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-green-600 transition"
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
                  <p className={`text-sm whitespace-pre-line ${msg.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {msg.text}
                  </p>
                  
                  {msg.steps && (
                    <div className="mt-3 space-y-1.5 text-sm text-gray-700">
                      {msg.steps.map((step, i) => (
                        <p key={i} className="leading-relaxed">{step}</p>
                      ))}
                    </div>
                  )}

                  {msg.map && (
                    <div className="mt-3 space-y-4">
                      {/* Map Image */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={mapImage} 
                          alt="GUC Campus Map" 
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-3 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-xs text-gray-600">Campus Map - Interactive version available on main portal</span>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-3">
                        {/* Location */}
                        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                          <Navigation className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Location</p>
                            <p className="text-sm text-gray-800 whitespace-pre-line">
                              {msg.contactInfo.location}
                            </p>
                          </div>
                        </div>

                        {/* Hotline */}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Hotline</p>
                            <a 
                              href={`tel:${msg.contactInfo.hotline.replace(/\s+/g, '')}`}
                              className="text-sm text-gray-800 hover:text-green-600 transition"
                            >
                              {msg.contactInfo.hotline}
                            </a>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Email</p>
                            <a 
                              href={`mailto:${msg.contactInfo.email}`}
                              className="text-sm text-gray-800 hover:text-green-600 transition"
                            >
                              {msg.contactInfo.email}
                            </a>
                          </div>
                        </div>

                        {/* Gates Information */}
                        <div className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                          <p className="text-sm font-medium text-gray-700 mb-2">🏛️ Main Gates Information:</p>
                          <div className="space-y-2">
                            {msg.contactInfo.gates.map((gate, i) => (
                              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                                {gate}
                              </p>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2 italic">
                            Note: Gate access may vary during special events or exams
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.searchResults && (
                    <div className="mt-3 space-y-2">
                      {msg.searchResults.map((result, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(result.query)}
                          className="block w-full text-left text-sm bg-green-50 hover:bg-green-100 text-gray-700 rounded-lg p-2 transition border border-green-200"
                        >
                          {result.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Map Action (Separated) */}
                  {msg.mapAction && (
                    <div className="mt-4 pt-3 border-t border-green-100">
                      <p className="text-xs text-gray-500 font-semibold mb-2">📍 Campus Navigation:</p>
                      <button
                        onClick={handleMapAction}
                        className="flex items-center justify-between w-full text-left text-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 rounded-lg p-2.5 transition border border-blue-200 group"
                      >
                        <div className="flex items-center gap-2">
                          <Map className="w-4 h-4 text-blue-600" />
                          <span>{msg.mapAction.label}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}

                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className={`mt-3 space-y-2 ${msg.mapAction ? '' : 'pt-3 border-t border-green-100'}`}>
                      <p className="text-xs text-gray-500 font-semibold">Quick Actions:</p>
                      {msg.quickActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(action)}
                          className="flex items-center justify-between w-full text-left text-sm bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 text-gray-700 rounded-lg p-2.5 transition border border-green-200 group"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.type === 'bot' && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about campus services..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full p-2 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Chat history • Smart search • Quick navigation
            </p>
          </div>
        </div>
      )}
    </>
  );
}