import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, ArrowRight, Download, Trash2, Search } from "lucide-react";

// Modern Admin Chatbot Component with Professional Features
export default function AdminChatbot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryKey = 'admin-chat-history';

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
      text: "👋 Hi Admin! I'm your Administrative Assistant. I can help you with:",
      timestamp: new Date().toISOString(),
      quickActions: [
        // Match your dashboard's tab keys
        { label: "Create Admin/Officer", section: "overview", tab: null },
        { label: "Manage Admins/Officers", section: "overview", tab: null },
        { label: "Pending Users", section: "overview", tab: null },
        { label: "Upcoming Events", section: "upcoming", tab: null }
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
    "create admin": {
      steps: [
        "To create a new Admin or Officer account:",
        "",
        "1. Go to the Overview section",
        "2. Click 'Create Admin/Officer' in Quick Actions",
        "3. Fill in the required information:",
        "   • Full name",
        "   • Email address",
        "   • Select role (Admin or Officer)",
        "   • Set initial password",
        "   • Assign permissions if applicable",
        "4. Review all information carefully",
        "5. Click 'Create Account' to submit",
        "6. The new admin/officer will receive login credentials",
        "7. They can change their password on first login"
      ],
      quickActions: [
        { label: "Go to Overview", section: "overview", tab: null }
      ],
      keywords: ["create", "admin", "officer", "new account", "add admin"]
    },
    "manage admins": {
      steps: [
        "To manage existing Admins and Officers:",
        "",
        "1. Go to the Overview section",
        "2. Click 'Manage Admins/Officers' in Quick Actions",
        "3. You'll see a list of all admin/officer accounts:",
        "   • View their roles and permissions",
        "   • Check account status (Active/Inactive)",
        "   • See last login times",
        "4. For each account you can:",
        "   • Edit permissions and role",
        "   • Deactivate or reactivate accounts",
        "   • Reset passwords if needed",
        "   • View activity logs",
        "5. Use search to find specific admins",
        "6. Changes take effect immediately"
      ],
      quickActions: [
        { label: "Go to Overview", section: "overview", tab: "quickActions" }
      ],
      keywords: ["manage", "admins", "officers", "edit", "permissions"]
    },
    "pending users": {
      steps: [
        "To manage pending user registrations:",
        "",
        "1. Go to the Overview section",
        "2. Click 'Pending Users' in Quick Actions",
        "3. You'll see all unverified user accounts:",
        "   • Name and email",
        "   • Registration date",
        "   • Requested role (Professor/TA/Staff)",
        "   • Submitted documents (if any)",
        "4. For each pending user you can:",
        "   • Review their information",
        "   • Verify uploaded documents",
        "   • Approve their registration",
        "   • Reject with reason",
        "   • Request additional information",
        "5. Approved users receive email confirmation",
        "6. They can then log in to the platform"
      ],
      quickActions: [
        { label: "Go to Overview", section: "overview", tab: "quickActions" }
      ],
      keywords: ["pending", "users", "verification", "approve", "reject"]
    },
    "upcoming events": {
      steps: [
        "To manage upcoming events:",
        "",
        "1. Click 'Upcoming Events' in the sidebar",
        "2. View all scheduled events with details:",
        "   • Event type (Workshop/Trip/Bazaar/Conference)",
        "   • Date, time, and location",
        "   • Creator and status",
        "   • Registration count",
        "3. You can:",
        "   • Approve pending events",
        "   • Edit event details",
        "   • Request changes from creators",
        "   • Cancel or archive events",
        "   • View registered participants",
        "   • Send notifications to attendees",
        "4. Use filters to find specific events",
        "5. Monitor event capacity and registrations"
      ],
      quickActions: [
        { label: "View Events", section: "upcoming", tab: null }
      ],
      keywords: ["upcoming", "events", "approve", "manage", "schedule"]
    },
    "events reviews": {
      steps: [
        "To manage event reviews and comments:",
        "",
        "1. Click 'Events Reviews' in the sidebar",
        "2. Browse all reviews from users:",
        "   • See event ratings (1-5 stars)",
        "   • Read detailed comments",
        "   • View reviewer information",
        "   • Check review timestamps",
        "3. Moderation actions available:",
        "   • Flag inappropriate reviews",
        "   • Remove violating content",
        "   • Respond to feedback",
        "   • Track trends and patterns",
        "4. Use insights to improve events",
        "5. Filter by event or rating level",
        "6. Export review data for analysis"
      ],
      quickActions: [
        { label: "View Reviews", section: "allComments", tab: null }
      ],
      keywords: ["reviews", "comments", "ratings", "moderate", "feedback"]
    },
    "vendor requests": {
      steps: [
        "To manage vendor booth requests:",
        "",
        "1. Click 'Vendor Requests' in the sidebar",
        "2. View all pending vendor applications:",
        "   • Vendor company details",
        "   • Requested booth type and size",
        "   • Products/services offered",
        "   • Business documentation",
        "3. Review each request:",
        "   • Verify business credentials",
        "   • Check product compliance",
        "   • Assess booth requirements",
        "   • Review pricing and terms",
        "4. Actions available:",
        "   • Approve vendor request",
        "   • Reject with feedback",
        "   • Request more information",
        "   • Negotiate booth terms",
        "5. Approved vendors appear in Available Booths",
        "6. Send confirmation and next steps"
      ],
      quickActions: [
        { label: "View Requests", section: "vendorRequests", tab: null }
      ],
      keywords: ["vendor", "requests", "booth", "approve", "applications"]
    },
    "available booths": {
      steps: [
        "To view and manage available booths:",
        "",
        "1. Click 'Available Booths' in the sidebar",
        "2. See all approved vendor booths:",
        "   • Booth assignments and locations",
        "   • Vendor company information",
        "   • Booth sizes and types",
        "   • Associated bazaar events",
        "3. Administrative view shows:",
        "   • Booking status",
        "   • Payment status",
        "   • Setup requirements",
        "4. You can:",
        "   • Reassign booth locations",
        "   • Update booth information",
        "   • Monitor vendor compliance",
        "5. This is informational for planning bazaar layouts"
      ],
      quickActions: [
        { label: "View Booths", section: "availableBooths", tab: null }
      ],
      keywords: ["available", "booths", "vendor", "assignments", "locations"]
    },
    "loyalty vendors": {
      steps: [
        "To manage loyalty vendor programs:",
        "",
        "1. Click 'Loyalty Vendors' in the sidebar",
        "2. View all registered loyalty vendors:",
        "   • Vendor name and description",
        "   • Loyalty program details",
        "   • Terms and benefits",
        "   • Active user count",
        "3. Administrative actions:",
        "   • Approve new loyalty programs",
        "   • Edit vendor information",
        "   • Suspend or remove vendors",
        "   • Monitor program performance",
        "4. Review vendor compliance:",
        "   • Check terms adherence",
        "   • Verify rewards delivery",
        "   • Handle user complaints",
        "5. Update vendor listings as needed",
        "6. Track participation metrics"
      ],
      quickActions: [
        { label: "View Vendors", section: "loyaltyVendors", tab: null }
      ],
      keywords: ["loyalty", "vendors", "programs", "rewards", "compliance"]
    },
    "view documents": {
      steps: [
        "To access and manage platform documents:",
        "",
        "1. Click 'View Documents' in the sidebar",
        "2. Browse all uploaded documents:",
        "   • User verification documents",
        "   • Event materials and files",
        "   • Vendor business documents",
        "   • Compliance certifications",
        "3. Document management features:",
        "   • Preview documents",
        "   • Download files",
        "   • Verify authenticity",
        "   • Organize by category",
        "4. Security features:",
        "   • Access logs tracked",
        "   • Sensitive data protected",
        "   • Retention policies enforced",
        "5. Search and filter documents",
        "6. Archive or delete as needed"
      ],
      quickActions: [
        { label: "View Documents", section: "documents", tab: null }
      ],
      keywords: ["documents", "files", "uploads", "verification", "certificates"]
    },
    "all users": {
      steps: [
        "To view and manage all platform users:",
        "",
        "1. Click 'All Users' in the sidebar",
        "2. See complete user database:",
        "   • Professors, TAs, Staff",
        "   • Account status (Active/Inactive)",
        "   • Verification status",
        "   • Registration dates",
        "3. User management options:",
        "   • View detailed profiles",
        "   • Edit user information",
        "   • Deactivate/reactivate accounts",
        "   • Reset passwords",
        "   • Change user roles",
        "4. Search and filter users:",
        "   • By name or email",
        "   • By role type",
        "   • By status",
        "5. Export user data for reports",
        "6. Monitor user activity and engagement"
      ],
      quickActions: [
        { label: "View All Users", section: "users", tab: null }
      ],
      keywords: ["all users", "professors", "tas", "staff", "database", "manage"]
    },
    "reports": {
      steps: [
        "To generate platform reports:",
        "",
        "1. Click 'Reports' in the sidebar",
        "2. Expand to see available reports:",
        "   • Attendees Report",
        "   • Revenue Report",
        "",
        "📊 Attendees Report:",
        "   • Event attendance statistics",
        "   • Registration vs attendance rates",
        "   • Popular event types",
        "   • User engagement metrics",
        "   • Export to Excel/PDF",
        "",
        "💰 Revenue Report:",
        "   • Event revenue breakdown",
        "   • Payment collection status",
        "   • Revenue by event type",
        "   • Financial trends",
        "   • Export financial data",
        "",
        "3. Select date ranges for analysis",
        "4. Filter by specific criteria",
        "5. Download reports for records"
      ],
      quickActions: [
        { label: "Generate Reports", section: "reports", tab: null }
      ],
      keywords: ["reports", "attendees", "revenue", "statistics", "export"]
    },
    "attendees report": {
      steps: [
        "To generate an Attendees Report:",
        "",
        "1. Navigate to Reports → Attendees Report",
        "2. The report shows:",
        "   • Total event attendees",
        "   • Attendance by event type",
        "   • Registration vs actual attendance",
        "   • Most attended events",
        "   • Attendance trends over time",
        "3. Filter options:",
        "   • Select date range",
        "   • Filter by event type",
        "   • Filter by user role",
        "4. View visualizations:",
        "   • Charts and graphs",
        "   • Trend analysis",
        "   • Comparative data",
        "5. Export report:",
        "   • Download as Excel",
        "   • Export as PDF",
        "   • Print for meetings"
      ],
      quickActions: [
        { label: "View Reports", section: "reports", tab: null }
      ],
      keywords: ["attendees", "attendance", "statistics", "metrics", "analytics"]
    },
    "revenue report": {
      steps: [
        "To generate a Revenue Report:",
        "",
        "1. Navigate to Reports → Revenue Report",
        "2. The report displays:",
        "   • Total revenue collected",
        "   • Revenue by event type",
        "   • Payment status breakdown",
        "   • Pending payments",
        "   • Refund information",
        "3. Financial insights:",
        "   • Top revenue-generating events",
        "   • Payment collection rates",
        "   • Financial trends",
        "   • Budget vs actual",
        "4. Filtering options:",
        "   • Date range selection",
        "   • Event type filter",
        "   • Payment status filter",
        "5. Export financial data:",
        "   • Excel format for accounting",
        "   • PDF for reports",
        "   • Share with stakeholders"
      ],
      quickActions: [
        { label: "View Reports", section: "reports", tab: null }
      ],
      keywords: ["revenue", "financial", "payments", "income", "budget"]
    },
    "platform statistics": {
      steps: [
        "Platform Statistics on the Overview page show:",
        "",
        "📊 Real-time metrics:",
        "",
        "1. Total Users",
        "   • All verified and active users",
        "   • Professors, TAs, and Staff combined",
        "   • Updated in real-time",
        "",
        "2. Pending Users",
        "   • Users awaiting verification",
        "   • Requires admin approval",
        "   • Click to review",
        "",
        "3. Events Today",
        "   • Events happening today",
        "   • Active and approved events only",
        "   • Includes all event types",
        "",
        "4. Active Events",
        "   • All upcoming approved events",
        "   • Events not yet past end date",
        "   • Total scheduled activities",
        "",
        "These statistics help you monitor platform health at a glance!"
      ],
      keywords: ["statistics", "metrics", "platform", "stats", "dashboard"]
    },
    "quick actions": {
      steps: [
        "Quick Actions on the Overview page provide:",
        "",
        "⚡ Three primary actions:",
        "",
        "1. Create Admin/Officer",
        "   • Add new administrative users",
        "   • Assign roles and permissions",
        "   • One-click access",
        "",
        "2. Manage Admins/Officers",
        "   • View all admin accounts",
        "   • Edit roles and permissions",
        "   • Deactivate accounts",
        "",
        "3. Pending Users",
        "   • Review registration requests",
        "   • Approve or reject users",
        "   • Verify credentials",
        "",
        "Click any button to instantly access that function!",
        "The active action is highlighted with a cyan ring.",
        "",
        "These are your most common administrative tasks,",
        "designed for quick access from the dashboard."
      ],
      quickActions: [
        { label: "Go to Overview", section: "overview", tab: "quickActions" }
      ],
      keywords: ["quick actions", "overview", "dashboard", "actions", "tasks"]
    },
    "dashboard overview": {
      steps: [
        "Your Admin Dashboard includes these sections:",
        "",
        "🏠 Overview",
        "   • Quick Actions (Create/Manage admins, Pending users)",
        "   • Platform Statistics (Live metrics)",
        "",
        "📅 Upcoming Events",
        "   • View and manage all scheduled events",
        "   • Approve, edit, or archive events",
        "",
        "💬 Events Reviews",
        "   • Monitor all event feedback",
        "   • Moderate comments",
        "",
        "🛍️ Available Booths",
        "   • View approved vendor booths",
        "   • Manage booth assignments",
        "",
        "📦 Vendor Requests",
        "   • Review vendor applications",
        "   • Approve or reject requests",
        "",
        "🏪 Loyalty Vendors",
        "   • Manage loyalty programs",
        "   • Monitor vendor compliance",
        "",
        "📁 View Documents",
        "   • Access all platform documents",
        "   • Verify credentials",
        "",
        "👥 All Users",
        "   • Manage all platform users",
        "   • Edit roles and status",
        "",
        "📊 Reports",
        "   • Attendees Report",
        "   • Revenue Report"
      ],
      quickActions: [
        { label: "Go to Overview", section: "overview", tab: null }
      ],
      keywords: ["dashboard", "overview", "sections", "navigation", "admin"]
    },
    "approve events": {
      steps: [
        "To approve pending events:",
        "",
        "1. Go to 'Upcoming Events' in the sidebar",
        "2. Filter or search for pending events",
        "3. Click on an event to view details:",
        "   • Review event information",
        "   • Check date, time, location",
        "   • Verify capacity and requirements",
        "   • Review creator credentials",
        "4. Make a decision:",
        "   • Click 'Approve' to publish event",
        "   • Click 'Request Edits' with feedback",
        "   • Click 'Reject' with reason",
        "5. Approved events become visible to users",
        "6. Creator receives notification of decision",
        "7. Requested edits return event to creator"
      ],
      quickActions: [
        { label: "View Events", section: "upcoming", tab: null }
      ],
      keywords: ["approve", "events", "pending", "publish", "review"]
    },
    "moderate reviews": {
      steps: [
        "To moderate event reviews:",
        "",
        "1. Navigate to 'Events Reviews'",
        "2. Browse all user reviews and ratings",
        "3. Look for:",
        "   • Inappropriate language",
        "   • Spam or irrelevant content",
        "   • Offensive comments",
        "   • False information",
        "4. Moderation actions:",
        "   • Flag review for attention",
        "   • Remove violating content",
        "   • Contact reviewer if needed",
        "   • Issue warnings for violations",
        "5. Document moderation decisions",
        "6. Maintain fair and consistent policies",
        "7. Protect platform integrity"
      ],
      quickActions: [
        { label: "View Reviews", section: "allComments", tab: null }
      ],
      keywords: ["moderate", "reviews", "comments", "moderation", "content"]
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
            { label: "Create Admin/Officer", section: "overview", tab: "quickActions" },
            { label: "Manage Admins/Officers", section: "overview", tab: "quickActions" },
            { label: "Pending Users", section: "overview", tab: "quickActions" },
            { label: "Upcoming Events", section: "upcomingEvents", tab: null },
            { label: "Vendor Requests", section: "vendorRequests", tab: null },
            { label: "Generate Reports", section: "reports", tab: null }
          ],
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Try asking about:\n• Creating/managing admins\n• Pending users\n• Upcoming events\n• Vendor requests\n• Reports generation\n• Platform statistics\n\nOr use the search feature to find what you need!",
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
      const sender = msg.type === 'user' ? 'You' : 'Admin Assistant';
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
    a.download = `admin-chat-${new Date().toISOString().split('T')[0]}.txt`;
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
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center z-50 group ${
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Admin Assistant</h3>
                <p className="text-xs text-indigo-100">Administrative Support System</p>
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
            <div className="p-3 bg-indigo-50 border-b border-indigo-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchInKnowledgeBase()}
                  placeholder="Search knowledge base..."
                  className="flex-1 border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  onClick={searchInKnowledgeBase}
                  className="bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-indigo-600 transition"
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
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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
                          className="block w-full text-left text-sm bg-indigo-50 hover:bg-indigo-100 text-gray-700 rounded-lg p-2 transition border border-indigo-200"
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
                          className="flex items-center justify-between w-full text-left text-sm bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-gray-700 rounded-lg p-2.5 transition border border-indigo-200 group"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
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
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-full p-2 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Administrative support • Quick navigation • Smart search
            </p>
          </div>
        </div>
      )}
    </>
  );
}