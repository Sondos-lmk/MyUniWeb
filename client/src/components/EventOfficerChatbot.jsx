import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, ArrowRight, Download, Trash2, Search } from "lucide-react";

// Modern Event Officer Chatbot Component with Professional Features
export default function EventOfficerChatbot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryKey = 'event-officer-chat-history';

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
        text: "👋 Hi Event Officer! I'm your Assistant. I can help you with:",
        timestamp: new Date().toISOString(),
        quickActions: [
          { label: "Create Event", page: "/eventOfficer/dashboard" },
          { label: "Approve Workshops", page: "/eventOfficer/approveWorkshops" },
          { label: "Approve Vendors", page: "/eventOfficer/dashboard" },
          { label: "Club Requests", page: "/eventOfficer/club-requests" },
          { label: "Gym Schedule", page: "/gym-schedule" }
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
    "club requests": {
      steps: [
        "1. Navigate to 'Club Requests' in the sidebar",
        "2. View all pending club creation requests from students",
        "3. For each club request, you'll see:",
        "   • Club name and description",
        "   • President/leader information",
        "   • Club mission and goals",
        "   • Meeting frequency and activities",
        "   • Any supporting documents",
        "4. To approve a club:",
        "   • Review all information carefully",
        "   • Click the 'Approve' button",
        "   • Club becomes officially registered",
        "   • Club leaders receive notification",
        "5. To reject a club:",
        "   • Click the 'Reject' button",
        "   • Provide a clear rejection reason",
        "   • Submit the rejection",
        "   • Student will be notified with your feedback",
        "6. Use the refresh button to load latest requests",
        "7. Track all approved/rejected clubs in history"
      ],
      quickActions: [
        { label: "Go to Club Requests", page: "/eventOfficer/club-requests" }
      ],
      keywords: ["club", "clubs", "club requests", "approve club", "reject club", "student clubs", "club creation"]
    },
    "create an event": {
      steps: [
        "1. From the dashboard, click 'Create Event' in Quick Actions",
        "2. Or navigate directly to the Create Event page",
        "3. Fill in the event details:",
        "   • Event title and description",
        "   • Event type (Workshop/Trip/Bazaar/Conference)",
        "   • Date and time (start and end)",
        "   • Location or venue",
        "   • Capacity and price",
        "   • Registration deadline",
        "4. Add any special requirements or notes",
        "5. Upload relevant documents or images",
        "6. Review all information carefully",
        "7. Click 'Create Event' to publish",
        "8. Event will be visible to professors and students"
      ],
      quickActions: [
        { label: "Go to Create Event", page: "/eventOfficer/dashboard" }
      ],
      keywords: ["create", "event", "new event", "organize event", "add event"]
    },
    "approve workshops": {
      steps: [
        "1. Click on 'Workshops' in the sidebar",
        "2. You'll see all pending workshop requests",
        "3. For each workshop:",
        "   • Review the title and description",
        "   • Check date, time, and capacity",
        "   • Verify professor credentials",
        "   • Review any uploaded materials",
        "4. To approve:",
        "   • Click 'Approve' button",
        "   • Workshop becomes available for registration",
        "5. To request edits:",
        "   • Click 'Request Edit'",
        "   • Provide specific feedback and changes needed",
        "6. To reject:",
        "   • Click 'Reject'",
        "   • Provide reason for rejection",
        "7. Professor will be notified of your decision"
      ],
      quickActions: [
        { label: "Go to Approve Workshops", page: "/eventOfficer/approveWorkshops" }
      ],
      keywords: ["approve", "workshops", "review", "pending", "workshop approval"]
    },
    "manage vendors": {
      steps: [
        "1. Click on 'Approve Vendors' in Quick Actions",
        "2. Or navigate to the vendor management section",
        "3. Review pending vendor applications:",
        "   • Company name and description",
        "   • Business documents and licenses",
        "   • Booth size preferences",
        "   • Products or services offered",
        "4. To approve a vendor:",
        "   • Click 'Approve' button",
        "   • Vendor gains access to bazaar applications",
        "5. To reject:",
        "   • Click 'Reject' and provide reason",
        "6. Approved vendors can:",
        "   • Apply for booth spaces",
        "   • Access loyalty program features",
        "   • Participate in vendor polls"
      ],
      quickActions: [
        { label: "Go to Approve Vendors", page: "/eventOfficer/dashboard" }
      ],
      keywords: ["manage", "vendors", "vendor approval", "approve vendors", "vendor management"]
    },
    "create gym session": {
      steps: [
        "1. From dashboard, click 'Create Gym Session' in Quick Actions",
        "2. Or navigate to Gym Schedule section",
        "3. Fill in session details:",
        "   • Session name/type (Cardio, Strength, Yoga, etc.)",
        "   • Day of the week",
        "   • Start time and duration",
        "   • Instructor name (if applicable)",
        "   • Maximum capacity",
        "4. Add any equipment requirements",
        "5. Set registration rules (if needed)",
        "6. Click 'Create Session'",
        "7. Session appears in the gym schedule",
        "8. Professors can view and plan gym visits"
      ],
      quickActions: [
        { label: "Go to Gym Schedule", page: "/gym-schedule" }
      ],
      keywords: ["gym", "session", "create gym", "gym schedule", "fitness"]
    },
    "view reports": {
      steps: [
        "1. Click on 'Reports' in the sidebar",
        "2. Choose from available reports:",
        "   • Attendees Report",
        "   • Revenue Report",
        "3. Attendees Report shows:",
        "   • Total registrations per event",
        "   • Attendance statistics",
        "   • Participant demographics",
        "   • Registration trends over time",
        "4. Revenue Report shows:",
        "   • Total revenue per event",
        "   • Payment status breakdown",
        "   • Revenue trends and analytics",
        "   • Financial summaries",
        "5. Use filters to:",
        "   • Select date ranges",
        "   • Filter by event type",
        "   • Search specific events",
        "6. Export reports as PDF or Excel"
      ],
      quickActions: [
        { label: "Go to Attendees Report", page: "/eventOfficer/attendees-report" },
        { label: "Go to Revenue Report", page: "/eventOfficer/revenue-report" }
      ],
      keywords: ["reports", "view reports", "attendees", "revenue", "analytics"]
    },
    "manage booths": {
      steps: [
        "1. Click on 'Available Booths' in the sidebar",
        "2. View all booth applications and assignments",
        "3. For each booth you can see:",
        "   • Vendor company name",
        "   • Booth size (2x2 or 4x4)",
        "   • Bazaar event details",
        "   • Application status",
        "   • Payment status",
        "4. To assign a booth:",
        "   • Review vendor application",
        "   • Check booth availability",
        "   • Click 'Assign Booth'",
        "   • Select location and booth number",
        "5. To reject an application:",
        "   • Click 'Reject'",
        "   • Provide reason to vendor",
        "6. Track all booth assignments",
        "7. Manage booth layout and capacity"
      ],
      quickActions: [
        { label: "Go to Available Booths", page: "/eventOfficer/available-booths" }
      ],
      keywords: ["manage", "booths", "booth assignment", "available booths", "booth management"]
    },
    "view documents": {
      steps: [
        "1. Click on 'View Documents' in the sidebar",
        "2. Access all event-related documents:",
        "   • Event proposals and plans",
        "   • Vendor contracts and agreements",
        "   • Insurance documents",
        "   • Registration forms",
        "   • Financial records",
        "3. Documents are organized by:",
        "   • Event name",
        "   • Document type",
        "   • Upload date",
        "4. You can:",
        "   • Download documents",
        "   • Preview documents online",
        "   • Search by keywords",
        "   • Filter by category or date",
        "5. Upload new documents as needed",
        "6. Manage document permissions"
      ],
      quickActions: [
        { label: "Go to Documents", page: "/eventOfficer/documents" }
      ],
      keywords: ["documents", "view documents", "files", "uploads", "records"]
    },
    "loyalty vendors": {
      steps: [
        "1. Click on 'Loyalty Vendors' in the sidebar",
        "2. View all vendors with loyalty programs",
        "3. For each vendor you can see:",
        "   • Company information",
        "   • Loyalty program details",
        "   • Benefits offered to members",
        "   • Number of enrolled professors",
        "4. Manage loyalty program approvals",
        "5. Review vendor benefits and rewards",
        "6. Monitor program engagement",
        "7. Handle vendor loyalty program disputes"
      ],
      quickActions: [
        { label: "Go to Loyalty Vendors", page: "/eventOfficer/loyalty-vendors" }
      ],
      keywords: ["loyalty", "vendors", "rewards", "benefits", "loyalty program"]
    },
    "gym schedule": {
      steps: [
        "1. Click on 'Gym Schedule' in the sidebar",
        "2. View the complete weekly gym schedule",
        "3. Schedule displays:",
        "   • All gym sessions by day and time",
        "   • Session types and instructors",
        "   • Capacity and current bookings",
        "   • Session status (Active/Cancelled)",
        "4. To edit a session:",
        "   • Click on the session",
        "   • Modify details as needed",
        "   • Save changes",
        "5. To cancel a session:",
        "   • Select the session",
        "   • Click 'Cancel'",
        "   • Users will be notified",
        "6. Add new sessions via Quick Actions"
      ],
      quickActions: [
        { label: "Go to Gym Schedule", page: "/gym-schedule" }
      ],
      keywords: ["gym", "schedule", "workout", "fitness", "timetable"]
    },
    "all events": {
      steps: [
        "1. Click on 'All Events' in the sidebar",
        "2. View comprehensive list of all events:",
        "   • Past events",
        "   • Current/ongoing events",
        "   • Upcoming events",
        "3. For each event you can see:",
        "   • Event details and status",
        "   • Registration statistics",
        "   • Revenue information",
        "   • Attendance data",
        "4. Use filters to sort by:",
        "   • Event type",
        "   • Date range",
        "   • Status (Published/Draft/Cancelled)",
        "5. Actions you can take:",
        "   • Edit event details",
        "   • Cancel events",
        "   • View participant lists",
        "   • Generate event reports",
        "   • Archive past events"
      ],
      quickActions: [
        { label: "Go to All Events", page: "/eventOfficer/all-events" }
      ],
      keywords: ["all events", "events list", "view events", "event management"]
    },
    "attendees report": {
      steps: [
        "1. Navigate to Reports → Attendees Report",
        "2. Select the event or date range",
        "3. View detailed attendance metrics:",
        "   • Total registrations",
        "   • Actual attendance",
        "   • No-shows and cancellations",
        "   • Check-in timestamps",
        "4. See demographic breakdowns:",
        "   • By department",
        "   • By role (Professor/Student)",
        "   • By registration date",
        "5. Analyze trends:",
        "   • Popular event types",
        "   • Peak registration times",
        "   • Attendance patterns",
        "6. Export data for further analysis",
        "7. Use insights to plan future events"
      ],
      quickActions: [
        { label: "Go to Attendees Report", page: "/eventOfficer/attendees-report" }
      ],
      keywords: ["attendees", "report", "attendance", "statistics", "analytics"]
    },
    "revenue report": {
      steps: [
        "1. Navigate to Reports → Revenue Report",
        "2. Select time period to analyze",
        "3. View financial metrics:",
        "   • Total revenue generated",
        "   • Revenue by event type",
        "   • Payment status breakdown",
        "   • Outstanding payments",
        "4. See detailed breakdowns:",
        "   • Revenue per event",
        "   • Ticket sales analysis",
        "   • Booth rental income",
        "   • Refunds and cancellations",
        "5. Track payment methods used",
        "6. Identify highest-earning events",
        "7. Export financial reports",
        "8. Use for budget planning"
      ],
      quickActions: [
        { label: "Go to Revenue Report", page: "/eventOfficer/revenue-report" }
      ],
      keywords: ["revenue", "report", "financial", "income", "payments"]
    },
    "event officer dashboard": {
      steps: [
        "Your Event Officer Dashboard includes:",
        "",
        "🏠 Overview:",
        "   • Quick Actions (Create Event, Approve Vendors, Create Gym Session)",
        "   • Event analytics and statistics",
        "",
        "📝 Workshops:",
        "   • Approve/reject professor workshop requests",
        "   • Request edits for workshops",
        "",
        "📅 All Events:",
        "   • View all platform events",
        "   • Manage event details and status",
        "",
        "👥 Club Requests:",
        "   • Approve/reject student club creation requests",
        "   • Manage club registrations and status",
        "",
        "🛍️ Available Booths:",
        "   • Manage vendor booth assignments",
        "   • Review booth applications",
        "",
        "💪 Gym Schedule:",
        "   • View and manage gym sessions",
        "   • Create new workout sessions",
        "",
        "🏪 Loyalty Vendors:",
        "   • Manage vendor loyalty programs",
        "",
        "📁 Documents:",
        "   • Access event-related documents",
        "",
        "📊 Reports:",
        "   • Attendees Report (registration analytics)",
        "   • Revenue Report (financial analytics)"
      ],
      quickActions: [
        { label: "Go to Overview", page: "/eventOfficer/dashboard" },
        { label: "View Workshops", page: "/eventOfficer/approveWorkshops" },
        { label: "View All Events", page: "/eventOfficer/all-events" },
        { label: "View Club Requests", page: "/eventOfficer/club-requests" }
      ],
      keywords: ["dashboard", "overview", "navigation", "event officer"]
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
            { label: "Create Event", page: "/eventOfficer/dashboard" },
            { label: "Approve Workshops", page: "/eventOfficer/approveWorkshops" },
            { label: "Approve Vendors", page: "/eventOfficer/dashboard" },
            { label: "Club Requests", page: "/eventOfficer/club-requests" },
            { label: "View Reports", page: "/eventOfficer/attendees-report" },
            { label: "Gym Schedule", page: "/gym-schedule" },
            { label: "Available Booths", page: "/eventOfficer/available-booths" }
          ],
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Try asking about:\n• Creating events\n• Approving workshops/vendors\n• Managing club requests\n• Managing booths\n• Gym schedule\n• Reports generation\n• Documents management\n\nOr use the search feature to find what you need!",
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
    console.log("Event Officer chatbot navigating to:", action);
    
    // Add navigation confirmation message
    const navigationMessage = {
      type: 'bot',
      text: `📍 **Navigating to ${action.label}**\n\nI'm taking you to that page now. The chat will stay open so you can continue asking questions.`,
      timestamp: new Date().toISOString(),
      isNavigationMessage: true
    };
    
    setMessages(prev => [...prev, navigationMessage]);
    
    // Navigate to the page
    setTimeout(() => {
      if (action.page) {
        if (onNavigate && typeof onNavigate === 'function') {
          onNavigate(action.page);
        } else {
          // Fallback: Use window location or react-router
          window.location.href = action.page;
        }
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
      const sender = msg.type === 'user' ? 'You' : 'Event Officer Assistant';
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
    a.download = `event-officer-chat-${new Date().toISOString().split('T')[0]}.txt`;
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
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center z-50 group ${
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Event Officer Assistant</h3>
                <p className="text-xs text-blue-100">Smart Event Management</p>
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
            <div className="p-3 bg-blue-50 border-b border-blue-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchInKnowledgeBase()}
                  placeholder="Search knowledge base..."
                  className="flex-1 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={searchInKnowledgeBase}
                  className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600 transition"
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
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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
                          className="block w-full text-left text-sm bg-blue-50 hover:bg-blue-100 text-gray-700 rounded-lg p-2 transition border border-blue-200"
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
                          className="flex items-center justify-between w-full text-left text-sm bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-gray-700 rounded-lg p-2.5 transition border border-blue-200 group"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.isNavigationMessage && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700">
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
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-2 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Event management • Page navigation • Smart help
            </p>
          </div>
        </div>
      )}
    </>
  );
}