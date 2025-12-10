import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, ArrowRight, Download, Trash2, Search } from "lucide-react";

// Modern Professor Chatbot Component with Professional Features
export default function ProfessorChatbot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryKey = 'professor-chat-history';

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
        text: "👋 Hi Professor! I'm your Academic Assistant. I can help you with:",
        timestamp: new Date().toISOString(),
        quickActions: [
          { label: "Create Workshop", section: "overview", tab: "createWorkshop" },
          { label: "My Workshops", section: "overview", tab: "myWorkshops" },
          { label: "Events Management", section: "events", tab: null },
          { label: "Gym Schedule", section: "gymSchedule", tab: null }
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
    "create a workshop": {
      steps: [
        "1. From the dashboard, click 'Create Workshop' in Quick Actions",
        "2. Or navigate to the workshop creation page",
        "3. Fill in the workshop details:",
        "   • Workshop title and description",
        "   • Date and time",
        "   • Location/venue",
        "   • Capacity and registration deadline",
        "   • Any prerequisites or materials needed",
        "4. Review all information carefully",
        "5. Click 'Submit' to create your workshop",
        "6. Your workshop will be pending admin approval",
        "7. You'll be notified once it's approved or if edits are needed"
      ],
      quickActions: [
        { label: "Go to Create Workshop", section: "overview", tab: "createWorkshop" }
      ],
      keywords: ["create", "workshop", "new workshop", "organize"]
    },
    "view my workshops": {
      steps: [
        "1. Click on 'Overview' in the sidebar",
        "2. Click 'My Workshops' in the Quick Actions section",
        "3. Or navigate to My Workshops page directly",
        "4. Here you can:",
        "   • See all workshops you've created",
        "   • Check their approval status (Pending/Approved/Rejected)",
        "   • View registration deadlines",
        "   • See if admin requested any edits",
        "5. For each workshop you can:",
        "   • Click 'Edit' to modify details",
        "   • Click 'Participants' to see who registered",
        "6. If edits were requested, update and resubmit"
      ],
      quickActions: [
        { label: "Go to My Workshops", section: "overview", tab: "myWorkshops" }
      ],
      keywords: ["my workshops", "created", "view", "manage", "workshops"]
    },
    "register for events": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Make sure you're on the 'Upcoming Events' tab",
        "3. Browse available events or use filters:",
        "   • Search by event or professor name",
        "   • Filter by type (Workshop/Trip/Bazaar/Conference)",
        "   • Filter by location or date",
        "   • Sort by oldest/newest first",
        "4. Click on any event card to view details",
        "5. Click 'Register' button on the event",
        "6. Fill in the registration form",
        "7. Submit to complete your registration",
        "8. Check 'My Registrations' tab to see status"
      ],
      quickActions: [
        { label: "Go to Events", section: "events", tab: "upcoming" }
      ],
      keywords: ["register", "events", "sign up", "join", "enroll"]
    },
    "check gym schedule": {
      steps: [
        "1. Click on 'Gym Schedule' in the sidebar",
        "2. You'll see the complete gym timetable",
        "3. Schedule shows:",
        "   • Days and times for each session",
        "   • Available gym slots",
        "   • Instructor names (if applicable)",
        "   • Session types or focus areas",
        "4. You can filter or search for specific times",
        "5. Note any restrictions or capacity limits"
      ],
      quickActions: [
        { label: "Go to Gym Schedule", section: "gymSchedule", tab: null }
      ],
      keywords: ["gym", "schedule", "workout", "fitness", "timetable"]
    },
    "view booth polls": {
      steps: [
        "1. Click on 'Booth Polls' in the sidebar",
        "2. You'll see active vendor booth polls",
        "3. For each poll you can:",
        "   • View the vendor's booth details",
        "   • See what they're offering/showcasing",
        "   • Read descriptions and benefits",
        "4. Cast your vote on booths you're interested in",
        "5. Your votes help determine popular vendors",
        "6. Results may influence future bazaar selections"
      ],
      quickActions: [
        { label: "Go to Booth Polls", section: "boothPolls", tab: null }
      ],
      keywords: ["booth", "polls", "vote", "vendor", "bazaar"]
    },
    "browse loyalty vendors": {
      steps: [
        "1. Click on 'Loyalty Vendors' in the sidebar",
        "2. Browse the list of registered vendors",
        "3. For each vendor you can see:",
        "   • Company name and description",
        "   • Loyalty program benefits",
        "   • Points or rewards offered",
        "   • Contact information",
        "4. Click on a vendor to view full details",
        "5. Join loyalty programs you're interested in",
        "6. Track your rewards and benefits"
      ],
      quickActions: [
        { label: "Go to Loyalty Vendors", section: "loyaltyVendors", tab: null }
      ],
      keywords: ["loyalty", "vendors", "rewards", "benefits", "program"]
    },
    "manage favorites": {
      steps: [
        "1. Go to 'Events' section in the sidebar",
        "2. Click the 'Favorites' tab",
        "3. To add events to favorites:",
        "   • Go to 'Upcoming Events' tab",
        "   • Click the heart icon on any event card",
        "4. In your Favorites tab you can:",
        "   • View all saved events",
        "   • Quickly access event details",
        "   • Remove events by clicking the heart again",
        "5. Favorites help you track events of interest"
      ],
      quickActions: [
        { label: "Go to Favorites", section: "events", tab: "favorites" }
      ],
      keywords: ["favorites", "saved", "heart", "bookmark"]
    },
    "check registrations": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Go to the 'My Registrations' tab",
        "3. Here you can see:",
        "   • All events you've registered for",
        "   • Registration status (Pending/Confirmed)",
        "   • Payment status if applicable",
        "   • Event dates and times",
        "4. You can:",
        "   • View registration details",
        "   • Make payments if required",
        "   • Cancel registrations if needed",
        "5. Keep track of upcoming commitments"
      ],
      quickActions: [
        { label: "Go to My Registrations", section: "events", tab: "registered" }
      ],
      keywords: ["registrations", "registered", "my events", "status"]
    },
    "attended events": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Go to the 'Attended Events' tab",
        "3. View all events you've completed",
        "4. For each attended event you can:",
        "   • Rate the event (1-5 stars)",
        "   • Write a detailed review/comment",
        "   • Share your experience and feedback",
        "5. Your reviews help improve future events",
        "6. Other professors can see your feedback"
      ],
      quickActions: [
        { label: "Go to Attended Events", section: "events", tab: "attended" }
      ],
      keywords: ["attended", "past events", "rate", "review"]
    },
    "events reviews": {
      steps: [
        "1. Click on 'Events Reviews' in the sidebar",
        "2. Browse reviews from all professors",
        "3. You can see:",
        "   • Event ratings and feedback",
        "   • Comments from attendees",
        "   • Overall event quality indicators",
        "4. Use reviews to decide on future events",
        "5. Filter or search for specific event reviews",
        "6. Add your own reviews for attended events"
      ],
      quickActions: [
        { label: "Go to Events Reviews", section: "eventsReviews", tab: null }
      ],
      keywords: ["reviews", "feedback", "ratings", "comments"]
    },
    "available booths": {
      steps: [
        "1. Click on 'Available Booths' in the sidebar",
        "2. View all booths at upcoming bazaars",
        "3. For each booth you can see:",
        "   • Vendor name and company",
        "   • Products or services offered",
        "   • Booth location and size",
        "   • Bazaar event details",
        "4. Browse by category or search",
        "5. This is informational only for professors",
        "6. Use this to plan your bazaar visits"
      ],
      quickActions: [
        { label: "Go to Available Booths", section: "availableBooths", tab: null }
      ],
      keywords: ["available", "booths", "vendor", "bazaar", "shop"]
    },
    "edit workshop": {
      steps: [
        "1. Go to 'My Workshops' section",
        "2. Find the workshop you want to edit",
        "3. Click the 'Edit' button",
        "4. Update any workshop details:",
        "   • Title, description, dates",
        "   • Location and capacity",
        "   • Requirements and materials",
        "5. If admin requested edits, address them",
        "6. Save your changes",
        "7. Workshop may need re-approval if significantly changed"
      ],
      quickActions: [
        { label: "Go to My Workshops", section: "overview", tab: "myWorkshops" }
      ],
      keywords: ["edit", "workshop", "modify", "update"]
    },
    "view participants": {
      steps: [
        "1. Navigate to 'My Workshops'",
        "2. Find the workshop you created",
        "3. Click the 'Participants' button",
        "4. You'll see:",
        "   • List of all registered participants",
        "   • Their names and email addresses",
        "   • Registration timestamps",
        "   • Total capacity vs registered count",
        "5. You can export this list if needed",
        "6. Use this to prepare materials and plan logistics"
      ],
      quickActions: [
        { label: "Go to My Workshops", section: "overview", tab: "myWorkshops" }
      ],
      keywords: ["participants", "attendees", "registered", "list"]
    },
    "events management": {
      steps: [
        "The Events section includes:",
        "",
        "📅 Upcoming Events:",
        "   • Browse all upcoming events",
        "   • Search, filter, and sort",
        "   • Register for events",
        "   • Add to favorites",
        "",
        "📋 My Registrations:",
        "   • View your registered events",
        "   • Check registration status",
        "   • Make payments if needed",
        "   • Cancel registrations",
        "",
        "❤️ Favorites:",
        "   • View saved events",
        "   • Quick access to preferred events",
        "   • Remove favorites",
        "",
        "✅ Attended Events:",
        "   • View past events",
        "   • Rate and review",
        "   • Share feedback"
      ],
      quickActions: [
        { label: "Go to Events", section: "events", tab: "upcoming" },
        { label: "My Registrations", section: "events", tab: "registered" },
        { label: "Favorites", section: "events", tab: "favorites" }
      ],
      keywords: ["events", "management", "dashboard", "tabs"]
    },
    "professor dashboard": {
      steps: [
        "Your Professor Dashboard includes:",
        "",
        "🏠 Overview:",
        "   • Quick Actions (Create Workshop, My Workshops)",
        "   • Workshop management tools",
        "",
        "📅 Events:",
        "   • Complete event management",
        "   • Registration, favorites, attended",
        "   • Search and filter capabilities",
        "",
        "💬 Events Reviews:",
        "   • Browse all event feedback",
        "   • Ratings and comments",
        "",
        "🗳️ Booth Polls:",
        "   • Vote on vendor booths",
        "   • Influence bazaar selections",
        "",
        "🛍️ Available Booths:",
        "   • View bazaar vendors",
        "   • Plan your visits",
        "",
        "🏪 Loyalty Vendors:",
        "   • Browse loyalty programs",
        "   • Track rewards",
        "",
        "💪 Gym Schedule:",
        "   • Check facility times",
        "   • Plan workouts"
      ],
      quickActions: [
        { label: "Go to Overview", section: "overview", tab: null },
        { label: "Go to Events", section: "events", tab: null },
        { label: "Go to Gym Schedule", section: "gymSchedule", tab: null }
      ],
      keywords: ["dashboard", "overview", "navigation", "sections"]
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
            { label: "Create Workshop", section: "overview", tab: "createWorkshop" },
            { label: "My Workshops", section: "overview", tab: "myWorkshops" },
            { label: "Events Management", section: "events", tab: "upcoming" },
            { label: "Gym Schedule", section: "gymSchedule", tab: null },
            { label: "Booth Polls", section: "boothPolls", tab: null },
            { label: "Events Reviews", section: "eventsReviews", tab: null }
          ],
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Try asking about:\n• Creating/managing workshops\n• Events registration\n• Gym schedule\n• Booth polls\n• Events reviews\n• Loyalty vendors\n\nOr use the search feature to find what you need!",
          timestamp: new Date().toISOString()
        }]);
      }
      setIsTyping(false);
      
      // Auto-scroll after adding response
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 800);
  };

  const handleQuickAction = (action) => {
    console.log("Professor chatbot navigating to:", action);
    
    // Add navigation confirmation message
    const navigationMessage = {
      type: 'bot',
      text: `📍 **Navigating to ${action.label}**\n\nI've taken you there! The chat will stay open so you can continue asking questions.`,
      timestamp: new Date().toISOString(),
      isNavigationMessage: true
    };
    
    setMessages(prev => [...prev, navigationMessage]);
    
    // Trigger navigation WITHOUT closing chat
    setTimeout(() => {
      if (onNavigate && typeof onNavigate === 'function') {
        // Check if we need to handle special tab navigation
        if (action.section === "overview" && action.tab) {
          // For overview tabs, we need to set both section and activeQuickAction
          onNavigate(action.section, action.tab);
        } else {
          onNavigate(action.section);
        }
      } else {
        console.log("Would navigate to:", action.section, "tab:", action.tab);
      }
    }, 300);
    
    // Auto-scroll to see the navigation message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString();
      const sender = msg.type === 'user' ? 'You' : 'Academic Assistant';
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
    a.download = `professor-chat-${new Date().toISOString().split('T')[0]}.txt`;
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
                <h3 className="font-semibold text-white">Academic Assistant</h3>
                <p className="text-xs text-green-100">Smart Professor Support</p>
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

                  {msg.isNavigationMessage && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700">
                        💬 Chat remains open. Continue asking questions!
                      </p>
                    </div>
                  )}

                  {msg.type === 'bot' && !msg.isNavigationMessage && (
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
              Academic support • Quick navigation • Smart help
            </p>
          </div>
        </div>
      )}
    </>
  );
}