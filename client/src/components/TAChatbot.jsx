import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, ArrowRight, Download, Trash2, Search } from "lucide-react";

// Modern TA Chatbot Component with Professional Features
export default function TAChatbot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryKey = 'ta-chat-history';

  // Load chat history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(chatHistoryKey);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed);
      } catch (e) {
        // If parsing fails, start fresh
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
        text: "👋 Hi! I'm your TA Assistant. I can help you with:",
        timestamp: new Date().toISOString(),
        quickActions: [
          { label: "Register for Events", section: "events", tab: "upcoming" },
          { label: "My Registrations", section: "events", tab: "registered" },
          { label: "Manage Favorites", section: "events", tab: "favorites" },
          { label: "Gym Schedule", section: "gymSchedule" }
        ]
      }
    ]);
  };

  // Save chat history whenever messages change
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
    "register for events": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Make sure you're on the 'Upcoming Events' tab",
        "3. Browse available events or use the filters:",
        "   • Search by title in the search box",
        "   • Filter by type (Workshop/Trip/Bazaar/Conference)",
        "   • Filter by location",
        "   • Filter by specific date",
        "   • Sort by earliest or latest first",
        "4. Click on any event card to view full details",
        "5. Click the 'Register' button on the event",
        "6. Fill in the registration form with required information",
        "7. Submit to complete your registration",
        "8. Check 'My Registrations' tab to see your registration status"
      ],
      quickActions: [
        { label: "Go to Events", section: "events", tab: "upcoming" },
        { label: "My Registrations", section: "events", tab: "registered" }
      ],
      keywords: ["register", "event", "sign up", "join event", "enroll"]
    },
    "view my registrations": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Go to the 'My Registrations' tab",
        "3. Here you can see all events you've registered for:",
        "   • Registration status (Pending/Confirmed)",
        "   • Payment status if applicable",
        "   • Event dates and times",
        "   • Event location and details",
        "4. For each registration you can:",
        "   • View complete registration details",
        "   • Make payments if required",
        "   • Cancel registrations if needed",
        "5. Keep track of all your upcoming event commitments",
        "6. Receive notifications for any status changes"
      ],
      quickActions: [
        { label: "View Registrations", section: "events", tab: "registered" }
      ],
      keywords: ["registration", "registered", "my events", "signed up"]
    },
    "manage favorites": {
      steps: [
        "1. Go to 'Events' section in the sidebar",
        "2. Click the 'Favorites' tab to view saved events",
        "3. To add events to favorites:",
        "   • Go to 'Upcoming Events' tab",
        "   • Click the heart icon on any event card",
        "   • The heart will fill in to show it's favorited",
        "4. In your Favorites tab you can:",
        "   • View all your saved events in one place",
        "   • Quickly access event details",
        "   • Remove events by clicking the heart icon again",
        "5. Use favorites to bookmark events you're interested in",
        "6. Plan ahead by saving events you want to attend"
      ],
      quickActions: [
        { label: "View Favorites", section: "events", tab: "favorites" }
      ],
      keywords: ["favorite", "saved", "bookmark", "heart"]
    },
    "attended events": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Go to the 'Attended Events' tab",
        "3. View the complete list of events you've attended",
        "4. For each attended event you can:",
        "   • Rate the event (1-5 stars)",
        "   • Write a detailed review or comment",
        "   • Share your experience and feedback",
        "   • View event details and dates",
        "5. Your reviews help improve future events",
        "6. Other TAs and staff can benefit from your feedback",
        "7. Organizers use feedback to enhance event quality"
      ],
      quickActions: [
        { label: "View Attended Events", section: "events", tab: "attended" }
      ],
      keywords: ["attended", "past events", "rate", "review"]
    },
    "events reviews": {
      steps: [
        "1. Click on 'Events Reviews' in the sidebar",
        "2. Browse reviews and ratings from all TAs and staff",
        "3. You can see:",
        "   • Event ratings and overall scores",
        "   • Detailed comments from attendees",
        "   • Event quality indicators",
        "   • Feedback trends",
        "4. Use reviews to make informed decisions about future events",
        "5. Filter or search for specific event reviews",
        "6. Add your own reviews for events you've attended",
        "7. See what colleagues thought about past events"
      ],
      quickActions: [
        { label: "View Reviews", section: "eventsReviews" }
      ],
      keywords: ["review", "feedback", "rating", "comments"]
    },
    "booth polls": {
      steps: [
        "1. Click on 'Booth Polls' in the sidebar",
        "2. You'll see active vendor booth voting polls",
        "3. For each poll you can:",
        "   • View the vendor's booth proposal details",
        "   • See what products/services they'll showcase",
        "   • Read booth descriptions and benefits",
        "   • Review vendor background information",
        "4. Cast your vote on booths you're interested in",
        "5. Your vote counts toward booth selection",
        "6. Poll results may influence which vendors are invited",
        "7. Help shape future bazaar offerings",
        "8. Your input as a TA is valuable for the community"
      ],
      quickActions: [
        { label: "Go to Booth Polls", section: "boothPolls" }
      ],
      keywords: ["booth", "poll", "vote", "vendor"]
    },
    "available booths": {
      steps: [
        "1. Click on 'Available Booths' in the sidebar",
        "2. View all vendor booths at upcoming bazaars",
        "3. For each booth you can see:",
        "   • Vendor name and company information",
        "   • Products or services they're offering",
        "   • Booth location and size",
        "   • Associated bazaar event details",
        "4. Browse by category or use search function",
        "5. This helps you plan your bazaar visits",
        "6. Discover vendors and products before attending",
        "7. Make a list of booths you want to visit"
      ],
      quickActions: [
        { label: "View Booths", section: "availableBooths" }
      ],
      keywords: ["booth", "vendor", "bazaar", "shop"]
    },
    "loyalty vendors": {
      steps: [
        "1. Click on 'Loyalty Vendors' in the sidebar",
        "2. Browse the complete list of registered loyalty vendors",
        "3. For each vendor you can see:",
        "   • Company name and description",
        "   • Loyalty program benefits and perks",
        "   • Points or rewards system details",
        "   • Contact information and location",
        "4. Click on any vendor to view full details",
        "5. Join loyalty programs that interest you",
        "6. Track your accumulated rewards and benefits",
        "7. Take advantage of special TA discounts or offers"
      ],
      quickActions: [
        { label: "View Loyalty Vendors", section: "loyaltyVendors" }
      ],
      keywords: ["loyalty", "rewards", "vendor", "benefits"]
    },
    "gym schedule": {
      steps: [
        "1. Click on 'Gym Schedule' in the sidebar",
        "2. View the complete gym facility timetable",
        "3. The schedule displays:",
        "   • Days and times for each session",
        "   • Available gym slots and time blocks",
        "   • Instructor names (if applicable)",
        "   • Session types or focus areas",
        "   • Capacity and availability",
        "4. You can filter or search for specific times",
        "5. Note any restrictions or membership requirements",
        "6. Plan your workout schedule around available times",
        "7. Check back regularly for schedule updates"
      ],
      quickActions: [
        { label: "View Gym Schedule", section: "gymSchedule" }
      ],
      keywords: ["gym", "workout", "fitness", "schedule"]
    },
    "search events": {
      steps: [
        "1. Go to 'Events' section, 'Upcoming Events' tab",
        "2. Use the search and filter tools at the top:",
        "   • Search box: Type event title or keywords",
        "   • Type filter: Select Workshop/Trip/Bazaar/Conference",
        "   • Location filter: Enter or search location",
        "   • Date filter: Select specific date to find events",
        "3. Use the sort dropdown:",
        "   • Earliest First: Shows soonest events first",
        "   • Latest First: Shows furthest events first",
        "4. Click 'Reset Filters' to clear all filters",
        "5. Filters work together to narrow results",
        "6. Results update automatically as you type/select"
      ],
      keywords: ["search", "filter", "find events", "sort"]
    },
    "event filters": {
      steps: [
        "1. On the 'Upcoming Events' tab, find the filter section",
        "2. Available filters include:",
        "   • Search by title: Free text search",
        "   • Event type: Workshop, Trip, Bazaar, Conference",
        "   • Location: Filter by venue or area",
        "   • Date: Find events on specific dates",
        "3. Combine multiple filters for precise results",
        "4. Use the sort order to organize results:",
        "   • Earliest First (default)",
        "   • Latest First",
        "5. Click 'Reset Filters' to start over",
        "6. Filters help you find exactly what you're looking for"
      ],
      keywords: ["filter", "sort", "search", "type", "location", "date"]
    },
    "event types": {
      steps: [
        "Available event types you can register for:",
        "",
        "📚 Workshops:",
        "   • Skill-building and training sessions",
        "   • Professional development opportunities",
        "   • Hands-on learning experiences",
        "   • Academic enhancement programs",
        "",
        "✈️ Trips:",
        "   • Educational excursions",
        "   • Team building outings",
        "   • Cultural visits and tours",
        "",
        "🛍️ Bazaars:",
        "   • Vendor showcases and exhibitions",
        "   • Shopping opportunities",
        "   • Product demonstrations",
        "",
        "🎤 Conferences:",
        "   • Professional networking events",
        "   • Speaker sessions and panels",
        "   • Academic discussions",
        "   • Industry updates"
      ],
      keywords: ["workshop", "trip", "bazaar", "conference", "type"]
    },
    "how to rate": {
      steps: [
        "To rate and review attended events:",
        "",
        "1. Go to Events → Attended Events tab",
        "2. Find the event you want to review",
        "3. Click on the event card to expand details",
        "4. You'll see a rating section with:",
        "   • Star rating (1-5 stars)",
        "   • Comment/review text box",
        "5. Select your star rating by clicking stars",
        "6. Write your review in the comment box:",
        "   • Share what you liked",
        "   • Mention areas for improvement",
        "   • Be constructive and honest",
        "   • Consider the perspective of a TA",
        "7. Submit your review",
        "8. Your feedback will be visible to other TAs and staff",
        "9. Organizers will see your input for improvements"
      ],
      keywords: ["rate", "review", "feedback", "star", "comment"]
    },
    "vote on booths": {
      steps: [
        "To vote on vendor booth proposals:",
        "",
        "1. Navigate to 'Booth Polls' in the sidebar",
        "2. Browse available vendor booth proposals",
        "3. For each booth, you can see:",
        "   • Vendor information",
        "   • Proposed products/services",
        "   • Booth concept details",
        "4. Click on a booth to view full details",
        "5. Find the voting button or rating option",
        "6. Cast your vote by clicking vote/like",
        "7. You can typically vote for multiple booths",
        "8. Your votes help decide which vendors get selected",
        "9. Check back to see voting results and winners"
      ],
      keywords: ["vote", "poll", "booth", "vendor", "proposal"]
    },
    "ta role": {
      steps: [
        "As a Teaching Assistant (TA), you have access to:",
        "",
        "📅 Events Management:",
        "   • Browse and register for all types of events",
        "   • Track your registrations and attendance",
        "   • Save favorites and plan ahead",
        "",
        "⭐ Reviews & Feedback:",
        "   • Rate and review attended events",
        "   • Read reviews from other TAs and staff",
        "   • Help improve event quality",
        "",
        "🗳️ Community Participation:",
        "   • Vote on vendor booth proposals",
        "   • View available booths at bazaars",
        "   • Influence future vendor selections",
        "",
        "💪 Wellness:",
        "   • Access gym schedule and facilities",
        "   • Plan your fitness routine",
        "",
        "🎁 Benefits:",
        "   • Browse loyalty vendor programs",
        "   • Access special TA discounts",
        "   • Join rewards programs"
      ],
      keywords: ["ta", "role", "teaching assistant", "access", "permissions"]
    },
    "dashboard overview": {
      steps: [
        "Your TA Dashboard includes these sections:",
        "",
        "1. 📅 Events - Main event management hub",
        "   • Upcoming Events tab",
        "   • My Registrations tab",
        "   • Favorites tab",
        "   • Attended Events tab",
        "",
        "2. 💬 Events Reviews - Browse all event feedback",
        "",
        "3. 🗳️ Booth Polls - Vote on vendor proposals",
        "",
        "4. 🛍️ Available Booths - View bazaar vendors",
        "",
        "5. 🏪 Loyalty Vendors - Browse reward programs",
        "",
        "6. 💪 Gym Schedule - Check facility times",
        "",
        "Use the sidebar to navigate between sections!",
        "The dashboard is designed for easy access to all TA features."
      ],
      keywords: ["dashboard", "overview", "sections", "navigation"]
    }
  };

  const findBestMatch = (text) => {
    const lowerText = text.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    Object.entries(knowledgeBase).forEach(([key, value]) => {
      let score = 0;
      
      // Check if query contains the key
      if (lowerText.includes(key)) score += 10;
      
      // Check keywords
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
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "Here's what you need to know:",
          steps: match.steps,
          quickActions: match.quickActions,
          timestamp: new Date().toISOString()
        }]);
      } else if (text.toLowerCase().includes('help') || text.toLowerCase().includes('hi') || text.toLowerCase().includes('hello')) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm here to help! Here are some things I can assist you with:",
          quickActions: [
            { label: "Register for Events", section: "events", tab: "upcoming" },
            { label: "My Registrations", section: "events", tab: "registered" },
            { label: "Manage Favorites", section: "events", tab: "favorites" },
            { label: "Gym Schedule", section: "gymSchedule" },
            { label: "Booth Polls", section: "boothPolls" },
            { label: "Events Reviews", section: "eventsReviews" }
          ],
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Try asking about:\n• Registering for events\n• Managing favorites\n• Gym schedule\n• Booth polls\n• Reviews\n• Event filters and search\n\nOr use the search feature to find what you need!",
          timestamp: new Date().toISOString()
        }]);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (action) => {
    if (onNavigate) {
      onNavigate(action.section, action.tab);
    }
    
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `✓ Taking you to ${action.label}...`,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString();
      const sender = msg.type === 'user' ? 'You' : 'TA Assistant';
      let content = `[${time}] ${sender}: ${msg.text}`;
      
      if (msg.steps) {
        content += '\n' + msg.steps.join('\n');
      }
      
      return content;
    }).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ta-chat-${new Date().toISOString().split('T')[0]}.txt`;
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
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center z-50 group ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">TA Assistant</h3>
                <p className="text-xs text-green-100">Smart & Helpful for TAs</p>
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
            <div className="p-3 bg-green-50 border-b border-green-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchInKnowledgeBase()}
                  placeholder="Search knowledge base..."
                  className="flex-1 border border-green-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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

                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-500 font-semibold">Quick Actions:</p>
                      {msg.quickActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(action)}
                          className="flex items-center justify-between w-full text-left text-sm bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-700 rounded-lg p-2.5 transition border border-green-200 group"
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
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-2 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Smart matching • Quick navigation • Chat history
            </p>
          </div>
        </div>
      )}
    </>
  );
}