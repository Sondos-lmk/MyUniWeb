import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApplyBoothForm from "../components/ApplyBoothForm";
import MyApplications from "../components/MyApplications";
import API from "../services/api";
import LoyaltyManager from "../components/LoyalityProgrameManger";
import DashboardLayout from "../components/DashboardLayout";
import ModernAlert from "../components/ui/ModernAlert";
import { Store, Calendar, FileText, Award } from "lucide-react";
import { MessageCircle, X, Send, Sparkles, ArrowRight, Download, Trash2, Search,Map,Mail,MapPin,Navigation } from "lucide-react";
import { useRef } from "react";

function VendorChatbot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryKey = 'vendor-chat-history';

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
        text: "👋 Hi Vendor! I'm your Vendor Assistant. I can help you with:",
        timestamp: new Date().toISOString(),
        quickActions: [
          { label: "Overview & Applications", section: "overview", tab: null },
          { label: "Apply for Booth", section: "applyBooth", tab: null },
          { label: "View Bazaar Events", section: "bazaarEvents", tab: null },
          { label: "Loyalty Program", section: "loyalty", tab: null }
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
    "apply for a bazaar booth": {
      steps: [
        "To apply for a bazaar booth:",
        "",
        "1. Click on 'Bazaar Events' in the sidebar",
        "2. Browse the list of upcoming bazaar events",
        "3. Click the 'Apply' button on your preferred event",
        "4. Fill in the application form with:",
        "   • Select your booth size (2x2 or 4x4)",
        "   • Add representative details (name & email)",
        "   • You can add up to 5 representatives",
        "5. Review the estimated price",
        "6. Click 'Submit Application'",
        "7. You'll receive a confirmation once submitted!"
      ],
      quickActions: [
        { label: "Go to Bazaar Events", section: "bazaarEvents", tab: null }
      ],
      keywords: ["apply", "booth", "bazaar", "application", "register"]
    },
    "check my applications": {
      steps: [
        "To check your applications:",
        "",
        "1. Go to the 'Overview' section (default view)",
        "2. Scroll down to 'My Applications' section",
        "3. Here you can see all your booth applications with:",
        "   • Event name and dates",
        "   • Application status (Pending/Approved/Rejected)",
        "   • Booth details and size",
        "   • Representatives listed",
        "4. You can track the progress of each application",
        "5. Approved applications show booth assignment details"
      ],
      quickActions: [
        { label: "Go to Overview", section: "overview", tab: null }
      ],
      keywords: ["applications", "my applications", "check status", "track"]
    },
    "update company logo": {
      steps: [
        "To update your company logo:",
        "",
        "1. Look at the top of your dashboard",
        "2. Hover over your company logo/avatar",
        "3. Click the camera icon that appears",
        "4. In the popup, click 'Select Image'",
        "5. Choose an image file (JPG, PNG, or GIF)",
        "6. Make sure it's under 5MB in size",
        "7. The logo will upload automatically",
        "8. Your new logo will be displayed instantly!",
        "",
        "Note: A good logo should be square and high resolution"
      ],
      keywords: ["logo", "company logo", "upload logo", "change logo", "profile"]
    },
    "manage loyalty program": {
      steps: [
        "To manage your loyalty program:",
        "",
        "1. Click on 'Loyalty Program' in the sidebar",
        "2. Here you can:",
        "   • View your current loyalty tier",
        "   • Check your points balance",
        "   • See available rewards and benefits",
        "   • Track your participation history",
        "3. Earn points by:",
        "   • Participating in bazaars",
        "   • Completing applications",
        "   • Being an active vendor",
        "   • Getting positive reviews",
        "4. Higher tiers unlock better benefits!"
      ],
      quickActions: [
        { label: "Go to Loyalty Program", section: "loyalty", tab: null }
      ],
      keywords: ["loyalty", "rewards", "points", "program", "benefits"]
    },
    "view upcoming events": {
      steps: [
        "To view upcoming bazaar events:",
        "",
        "1. Click on 'Bazaar Events' in the sidebar",
        "2. You'll see a list of all upcoming bazaars",
        "3. Each event shows:",
        "   • Event name and description",
        "   • Start and end dates",
        "   • Location and venue details",
        "   • Apply button (if not already applied)",
        "4. Events marked 'Applied' show you've already registered",
        "5. Click any 'Apply' button to start your application",
        "6. Filter events by date or location"
      ],
      quickActions: [
        { label: "Go to Bazaar Events", section: "bazaarEvents", tab: null }
      ],
      keywords: ["events", "upcoming", "bazaar", "calendar", "schedule"]
    },
    "apply for booth": {
      steps: [
        "To apply for a booth directly:",
        "",
        "1. Click 'Apply for Booth' in the sidebar",
        "2. You'll see the direct application form",
        "3. Select an event from the dropdown",
        "4. Choose your booth size (2x2 or 4x4)",
        "5. Add representatives (up to 5 people)",
        "6. Review estimated price based on duration",
        "7. Submit your application",
        "8. You can also browse events first in 'Bazaar Events'"
      ],
      quickActions: [
        { label: "Go to Apply Booth", section: "applyBooth", tab: null }
      ],
      keywords: ["apply booth", "register booth", "booth application", "sign up"]
    },
    "vendor dashboard": {
      steps: [
        "Your Vendor Dashboard includes:",
        "",
        "🏢 Overview Section:",
        "   • Company profile and logo",
        "   • My Applications list",
        "   • Quick status overview",
        "",
        "📝 Apply for Booth:",
        "   • Direct application form",
        "   • Event selection dropdown",
        "   • Booth size options",
        "   • Representative management",
        "",
        "📅 Bazaar Events:",
        "   • List of upcoming bazaars",
        "   • Event details and dates",
        "   • One-click applications",
        "   • Filter and search options",
        "",
        "🏆 Loyalty Program:",
        "   • Points and tier system",
        "   • Rewards and benefits",
        "   • Participation history",
        "   • Program details"
      ],
      quickActions: [
        { label: "Go to Overview", section: "overview", tab: null },
        { label: "View Bazaar Events", section: "bazaarEvents", tab: null },
        { label: "Check Loyalty", section: "loyalty", tab: null }
      ],
      keywords: ["dashboard", "vendor", "overview", "navigation", "sections"]
    },
    "booth sizes": {
      steps: [
        "Available booth sizes:",
        "",
        "📦 2x2 Booth (Standard):",
        "   • 4 square meters space",
        "   • Standard pricing",
        "   • Suitable for most vendors",
        "   • Basic setup included",
        "",
        "🚀 4x4 Booth (Premium):",
        "   • 16 square meters space",
        "   • 50% higher price than 2x2",
        "   • More display space",
        "   • Priority location",
        "   • Enhanced visibility",
        "",
        "Prices are calculated per day of the event duration."
      ],
      keywords: ["booth size", "2x2", "4x4", "premium", "standard", "space"]
    },
    "representatives": {
      steps: [
        "About booth representatives:",
        "",
        "👥 Each application can have:",
        "   • Up to 5 representatives",
        "   • Each needs name and email",
        "   • All receive event notifications",
        "   • Primary contact is first representative",
        "",
        "📋 Representative roles:",
        "   • Booth setup and management",
        "   • Customer interaction",
        "   • Sales and transactions",
        "   • Event coordination",
        "",
        "🔐 Important notes:",
        "   • All reps get event access passes",
        "   • Updates sent to all emails",
        "   • Can be modified before approval",
        "   • IDs may be required at event"
      ],
      keywords: ["representatives", "staff", "team", "contacts", "people"]
    },
    "pricing and payment": {
      steps: [
        "Booth pricing information:",
        "",
        "💰 Price calculation:",
        "   • Base price per day × number of days",
        "   • 4x4 booths cost 50% more than 2x2",
        "   • Prices shown are estimates",
        "   • Final price confirmed upon approval",
        "",
        "📅 Event duration:",
        "   • Price includes all event days",
        "   • Multi-day events prorated",
        "   • Setup/teardown days may be included",
        "",
        "💳 Payment process:",
        "   • Invoice sent after approval",
        "   • Multiple payment methods",
        "   • Payment deadlines apply",
        "   • Receipt provided upon payment"
      ],
      keywords: ["pricing", "payment", "price", "cost", "fee", "invoice"]
    },
    "application status": {
      steps: [
        "Understanding application status:",
        "",
        "⏳ Pending:",
        "   • Application submitted",
        "   • Under review by admin",
        "   • Usually takes 1-3 business days",
        "   • You'll be notified of any updates",
        "",
        "✅ Approved:",
        "   • Application accepted!",
        "   • Booth assigned",
        "   • Invoice will be sent",
        "   • Next steps provided",
        "",
        "❌ Rejected:",
        "   • Application not accepted",
        "   • Reason provided",
        "   • Can apply for other events",
        "   • Feedback given for improvement",
        "",
        "📊 Withdrawn:",
        "   • You cancelled application",
        "   • Can reapply if event open"
      ],
      keywords: ["status", "pending", "approved", "rejected", "tracking"]
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
            { label: "Overview & Applications", section: "overview", tab: null },
            { label: "Apply for Booth", section: "applyBooth", tab: null },
            { label: "View Bazaar Events", section: "bazaarEvents", tab: null },
            { label: "Loyalty Program", section: "loyalty", tab: null }
          ],
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Try asking about:\n• Applying for booths\n• Checking applications\n• Bazaar events\n• Loyalty program\n• Booth sizes and pricing\n\nOr use the search feature to find what you need!",
          timestamp: new Date().toISOString()
        }]);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (action) => {
    console.log("Vendor chatbot navigating to:", action);
    
    // Add confirmation message
    setMessages(prev => [...prev, {
      type: 'bot',
      text: `✓ Taking you to ${action.label}...`,
      timestamp: new Date().toISOString()
    }]);
    
    // Close chat and navigate
    setTimeout(() => {
      
      
      if (onNavigate && typeof onNavigate === 'function') {
        onNavigate(action.section);
      } else {
        console.log("Would navigate to:", action.section);
      }
    }, 500);
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString();
      const sender = msg.type === 'user' ? 'You' : 'Vendor Assistant';
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
    a.download = `vendor-chat-${new Date().toISOString().split('T')[0]}.txt`;
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
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center z-50 group ${
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
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Vendor Assistant</h3>
                <p className="text-xs text-blue-100">Smart Vendor Support</p>
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
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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
                          className="flex items-center justify-between w-full text-left text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-700 rounded-lg p-2.5 transition border border-blue-200 group"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
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
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-2 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Vendor support • Quick navigation • Smart help
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || "unknown";
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reps, setReps] = useState([{ name: "", email: "" }]);
  const [boothSize, setBoothSize] = useState("2x2");
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");
  const [formErrors, setFormErrors] = useState({});
  const [applications, setApplications] = useState([]);

  const token = localStorage.getItem("token");

  // Show modern alert
  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const sidebarItems = [
    { 
      key: "overview", 
      label: "Overview", 
      icon: Store, 
      onClick: () => setActiveSection("overview") 
    },
    { 
      key: "applyBooth", 
      label: "Apply for Booth", 
      icon: FileText, 
      onClick: () => setActiveSection("applyBooth") 
    },
    { 
      key: "bazaarEvents", 
      label: "Bazaar Events", 
      icon: Calendar, 
      onClick: () => setActiveSection("bazaarEvents") 
    },
    { 
      key: "loyalty", 
      label: "Loyalty Program", 
      icon: Award, 
      onClick: () => setActiveSection("loyalty") 
    },
  ];

  const quickActionClasses =
    "w-full h-16 text-sm font-semibold bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 flex items-center justify-center gap-2 text-white rounded-lg shadow";

  // Fetch vendor profile including logo
  useEffect(() => {
    if (role === 'vendor') {
      fetchVendorProfile();
    }
  }, [role]);

  const fetchVendorProfile = async () => {
    try {
      const res = await API.get('/users/vendor/profile');
      console.log('🖼️ Logo path:', res.data.vendor?.logo);
      setVendorData(res.data.vendor);
    } catch (error) {
      console.error('Failed to fetch vendor profile:', error);
    } finally {
      setVendorLoading(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Please select an image smaller than 5MB', 'error');
      return;
    }

    setLogoUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('companyName', vendorData?.companyName || '');

      const response = await API.put('/users/vendor/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Logo upload response:', response.data);
      
      setVendorData(prev => ({
        ...prev,
        logo: response.data.vendor.logo
      }));
      
      setShowLogoUpload(false);
      showAlert("Logo updated successfully!", "success");
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      showAlert(error.response?.data?.message || 'Failed to upload logo', "error");
    } finally {
      setLogoUploading(false);
      event.target.value = '';
    }
  };

  // Fetch upcoming bazaar events
  useEffect(() => {
    if (role !== "vendor") {
      setEvents([]);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await API.get("/events?type=bazaar", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const eventsArray = Array.isArray(res.data.events) ? res.data.events : [];
        const now = new Date();
        const upcomingBazaars = eventsArray.filter(
          (event) => new Date(event.startDate) > now
        );

        setEvents(upcomingBazaars);
      } catch (err) {
        console.error("Error fetching vendor events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchApplications = async () => {
      try {
        const res = await API.get("/events/my-applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const apps = Array.isArray(res.data)
          ? res.data
          : res.data?.applications || res.data?.data || [];
        setApplications(apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchEvents();
    fetchApplications();
  }, [role, token]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setReps([{ name: "", email: "" }]);
    setBoothSize("2x2");
    setFormErrors({});
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    reps.forEach((rep, idx) => {
      if (!rep.name || rep.name.trim() === "") {
        errors[`name_${idx}`] = "Name is required";
      }
      
      if (!rep.email || rep.email.trim() === "") {
        errors[`email_${idx}`] = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(rep.email)) {
        errors[`email_${idx}`] = "Please enter a valid email address";
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await API.post(
        `/events/bazaar/${selectedEvent._id}/register`,
        { reps, boothSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert(res.data.message || "Applied successfully!", "success");
      setSelectedEvent(null);
      setReps([{ name: "", email: "" }]);
      setBoothSize("2x2");
      setFormErrors({});
      
      // Refresh applications to update UI
      const appsRes = await API.get("/events/my-applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apps = Array.isArray(appsRes.data)
        ? appsRes.data
        : appsRes.data?.applications || appsRes.data?.data || [];
      setApplications(apps);
    } catch (err) {
      console.error("Error applying for bazaar:", err);
      showAlert(err.response?.data?.error || "Failed to apply", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedPrice = (event, boothSize) => {
    if (!event.startDate || !event.endDate) return { days: 0, price: 0 };

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { days: 0, price: 0 };

    const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor((endUTC - startUTC) / msPerDay) + 1;

    const sizeMultiplier = boothSize === "4x4" ? 1.5 : 1;
    const basePrice = event.basePricePerDay || 1000;

    const price = days * basePrice * sizeMultiplier;

    return { days, price };
  };

  const name = (() => {
    if (!user) return "Loading...";
    if (user.role === "vendor") return user?.companyName || "Vendor";
    return user.name || "User";
  })();

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* My Applications */}
            <div className="bg-white rounded-xl shadow-md p-4">
              
              <MyApplications />
            </div>
          </div>
        );

      case "applyBooth":
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
          
            <ApplyBoothForm />
          </div>
        );

      case "bazaarEvents":
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Bazaar Events</h2>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : !events?.length ? (
              <div className="text-center py-8 text-gray-600">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No upcoming bazaars yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {events.map((event) => {
                  const hasApplied = applications.some((app) => app.id === event._id || app.id === event._id.toString());
                  return (
                    <div
                      key={event._id}
                      className="border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(event.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(event.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-gray-700 mt-2">{event.desc}</p>
                      </div>
                      <button
                        onClick={() => !hasApplied && handleSelectEvent(event)}
                        disabled={hasApplied}
                        className={`px-6 py-2 rounded-lg transition ml-4 ${
                          hasApplied
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-400 text-white hover:bg-blue-600"
                        }`}
                      >
                        {hasApplied ? "Applied" : "Apply"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "loyalty":
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Loyalty Program Management</h2>
            <LoyaltyManager />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      dashboardTitle="Vendor Dashboard"
      roleLabel="Vendor"
      roleColor="bg-teal-500"
      sidebarItems={sidebarItems}
      activeKey={activeSection}
    >
      <style>{`
        .vendor-dashboard-wrapper ~ * .mb-8.bg-white.rounded-lg.shadow-lg:first-of-type {
          display: none !important;
        }
        .max-w-full.px-6.py-8 > .mb-8:first-child {
          display: none !important;
        }
      `}</style>
      
      <div className="vendor-dashboard-wrapper">
        {/* Custom Vendor Welcome Card */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-6">
            {/* Logo Section */}
            <div className="relative group">
              {vendorLoading ? (
                <div className="w-16 h-16 rounded-full border-2 border-blue-700 bg-gray-200 animate-pulse"></div>
              ) : vendorData?.logo ? (
                <div className="w-16 h-16 rounded-full border-2 border-blue-700 overflow-hidden bg-white shadow-md">
                  <img 
                    src={`http://localhost:4000${vendorData.logo}`}
                    alt={`${vendorData.companyName || 'Vendor'} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const fallback = e.target.parentElement.querySelector('.fallback-logo');
                      e.target.style.display = 'none';
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="fallback-logo w-full h-full bg-teal-100 hidden items-center justify-center absolute inset-0"
                  >
                    <span className="text-teal-800 font-bold text-2xl">
                      {(vendorData?.companyName || 'V').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-teal-600 bg-teal-100 flex items-center justify-center shadow-md">
                  <span className="text-teal-800 font-bold text-2xl">
                    {(vendorData?.companyName || name || 'V').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => setShowLogoUpload(true)}
                className="absolute -bottom-1 -right-1 bg-blue-700 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-blue-700"
                title="Change logo"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Company Info */}
            <div>
              <p className="text-gray-600 text-lg mb-1">Welcome back!</p>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{name}</h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-teal-500">
                  Vendor
                </span>
                {vendorData?.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-blue-400">
                    Verified ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>

      {/* Chatbot Component */}
      <VendorChatbot onNavigate={(section) => {
  console.log("Vendor chatbot navigating to:", section);
  setActiveSection(section);
}} />

      {/* Modern Alert Component */}
      <ModernAlert 
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />

      {/* Logo Upload Modal */}
      {showLogoUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Update Company Logo</h2>
            <p className="text-gray-600 mb-6">
              Upload a new logo for your company. Supported formats: JPG, PNG, GIF. Max size: 5MB.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={logoUploading}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer block"
              >
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">
                  {logoUploading ? 'Uploading...' : 'Click to select an image'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG, GIF • Max 5MB
                </p>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoUpload(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={logoUploading}
              >
                Cancel
              </button>
              <button
                onClick={() => document.getElementById('logo-upload').click()}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400"
                disabled={logoUploading}
              >
                {logoUploading ? 'Uploading...' : 'Select Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bazaar Application Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 pr-8">
              Apply for: {selectedEvent.title}
            </h2>
            
            <div className="bg-teal-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-gray-800">
                Duration: {calculateEstimatedPrice(selectedEvent, boothSize).days} days
              </p>
              <p className="font-semibold text-gray-800 mt-1">
                Estimated Price:{" "}
                <span className="text-teal-600 text-lg">
                  {calculateEstimatedPrice(selectedEvent, boothSize).price.toFixed(2)} EGP
                </span>
              </p>
            </div>

            <div>
              <label className="block mb-2 font-medium">Booth Size</label>
              <select
                className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={boothSize}
                onChange={(e) => setBoothSize(e.target.value)}
                required
              >
                <option value="2x2">2x2 (Standard)</option>
                <option value="4x4">4x4 (Premium)</option>
              </select>

              <label className="block mb-2 font-medium">Representatives</label>
              {reps.map((rep, idx) => (
                <div key={idx} className="mb-3 flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name"
                      className={`border ${formErrors[`name_${idx}`] ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 w-full mb-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                      value={rep.name}
                      onChange={(e) => {
                        const newReps = [...reps];
                        newReps[idx].name = e.target.value;
                        setReps(newReps);
                        // Clear error when user types
                        if (formErrors[`name_${idx}`]) {
                          setFormErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors[`name_${idx}`];
                            return newErrors;
                          });
                        }
                      }}
                      required
                    />
                    {formErrors[`name_${idx}`] && (
                      <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors[`name_${idx}`]}
                      </p>
                    )}
                    
                    <input
                      type="email"
                      placeholder="Email"
                      className={`border ${formErrors[`email_${idx}`] ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                      value={rep.email}
                      onChange={(e) => {
                        const newReps = [...reps];
                        newReps[idx].email = e.target.value;
                        setReps(newReps);
                        // Clear error when user types
                        if (formErrors[`email_${idx}`]) {
                          setFormErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors[`email_${idx}`];
                            return newErrors;
                          });
                        }
                      }}
                      required
                    />
                    {formErrors[`email_${idx}`] && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {formErrors[`email_${idx}`]}
                      </p>
                    )}
                  </div>
                  {reps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newReps = reps.filter((_, i) => i !== idx);
                        setReps(newReps);
                      }}
                      className="text-red-600 font-bold px-3 py-2 rounded-lg hover:bg-red-50 mt-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {reps.length < 5 && (
                <button
                  type="button"
                  onClick={() => setReps([...reps, { name: "", email: "" }])}
                  className="text-teal-600 hover:text-teal-700 font-medium mb-4"
                >
                  + Add Another Representative
                </button>
              )}

              <button
                onClick={handleSubmit}
                className="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 w-full font-semibold transition"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
  </div>
)}

    </DashboardLayout>
  );
}

export default Dashboard;