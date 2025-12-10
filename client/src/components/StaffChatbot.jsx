import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, ArrowRight, Download, Trash2, Search } from "lucide-react";

// Modern Staff Chatbot Component with Professional Features
export default function StaffChatbot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryKey = 'staff-chat-history';

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
        text: "👋 Hi! I'm your Staff Assistant. I can help you with:",
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
        "4. Click on any event card to view full details",
        "5. Click the 'Register' button on the event",
        "6. Fill in the registration form",
        "7. Submit to complete your registration"
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
        "4. You can view details, make payments, or cancel registrations"
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
        "4. To remove: Click the heart icon again",
        "5. Use favorites to bookmark events you're interested in"
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
        "3. View all events you've attended",
        "4. For each event you can:",
        "   • Rate the event (1-5 stars)",
        "   • Write a detailed review",
        "   • Share your experience and feedback"
      ],
      quickActions: [
        { label: "View Attended Events", section: "events", tab: "attended" }
      ],
      keywords: ["attended", "past events", "rate", "review"]
    },
    "events reviews": {
      steps: [
        "1. Click on 'Events Reviews' in the sidebar",
        "2. Browse reviews and ratings from all staff members",
        "3. See event ratings, comments, and feedback trends",
        "4. Use reviews to make informed decisions about future events"
      ],
      quickActions: [
        { label: "View Reviews", section: "eventsReviews" }
      ],
      keywords: ["review", "feedback", "rating", "comments"]
    },
    "booth polls": {
      steps: [
        "1. Click on 'Booth Polls' in the sidebar",
        "2. View active vendor booth voting polls",
        "3. Review vendor proposals and booth details",
        "4. Cast your vote on booths you're interested in",
        "5. Your votes help decide which vendors get selected"
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
        "3. Browse by category or search for specific vendors",
        "4. Plan your bazaar visits in advance"
      ],
      quickActions: [
        { label: "View Booths", section: "availableBooths" }
      ],
      keywords: ["booth", "vendor", "bazaar", "shop"]
    },
    "loyalty vendors": {
      steps: [
        "1. Click on 'Loyalty Vendors' in the sidebar",
        "2. Browse registered loyalty vendors",
        "3. View loyalty program benefits and rewards",
        "4. Join programs and track your benefits"
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
        "3. See available slots, instructors, and session types",
        "4. Plan your workout schedule"
      ],
      quickActions: [
        { label: "View Gym Schedule", section: "gymSchedule" }
      ],
      keywords: ["gym", "workout", "fitness", "schedule"]
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
          text: "I'm not sure about that. Try asking about:\n• Registering for events\n• Managing favorites\n• Gym schedule\n• Booth polls\n• Reviews\n\nOr use the search feature to find what you need!",
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
      const sender = msg.type === 'user' ? 'You' : 'Assistant';
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
    a.download = `staff-chat-${new Date().toISOString().split('T')[0]}.txt`;
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
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center z-50 group ${
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
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Staff Assistant</h3>
                <p className="text-xs text-cyan-100">Smart & Helpful</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
                title="Search"
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
            <div className="p-3 bg-cyan-50 border-b border-cyan-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchInKnowledgeBase()}
                  placeholder="Search knowledge base..."
                  className="flex-1 border border-cyan-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                />
                <button
                  onClick={searchInKnowledgeBase}
                  className="bg-cyan-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-cyan-600 transition"
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
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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
                          className="block w-full text-left text-sm bg-cyan-50 hover:bg-cyan-100 text-gray-700 rounded-lg p-2 transition border border-cyan-200"
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
                          className="flex items-center justify-between w-full text-left text-sm bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 text-gray-700 rounded-lg p-2.5 transition border border-cyan-200 group"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-1 transition-transform" />
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
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-2 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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