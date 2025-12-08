import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

// Reusable Admin Chatbot Component
export default function AdminChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi Admin! I'm your Administrative Assistant. I can help you with:",
      options: [
        "Create admin/officer",
        "Manage admins/officers",
        "Pending users",
        "Manage upcoming events",
        "View events reviews",
        "Manage vendor requests",
        "View available booths",
        "Loyalty vendors",
        "View documents",
        "All users",
        "Generate reports"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    }
  };

  const handleSendMessage = (text = inputValue) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = null;

      Object.keys(knowledgeBase).forEach(key => {
        if (lowerText.includes(key) || lowerText.includes(key.replace(/\s+/g, ''))) {
          response = knowledgeBase[key];
        }
      });

      if (response) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "Here's what you need to know:",
          steps: response.steps
        }]);
      } else if (lowerText.includes('help') || lowerText.includes('hi') || lowerText.includes('hello')) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm here to help! I can assist you with:",
          options: [
            "Create admin/officer",
            "Manage admins/officers",
            "Pending users",
            "Upcoming events",
            "Vendor requests",
            "Generate reports"
          ]
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Here's what I can help you with:",
          options: [
            "Quick actions",
            "Platform statistics",
            "Dashboard overview",
            "All users",
            "Events reviews",
            "Loyalty vendors"
          ]
        }]);
      }
      setIsTyping(false);
    }, 1000);
  };

  const handleOptionClick = (option) => {
    handleSendMessage(option);
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
                <p className="text-xs text-indigo-100">Here to help administrators</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
                  <p className={`text-sm ${msg.type === 'user' ? 'text-white' : 'text-gray-800'}`}>{msg.text}</p>
                  
                  {msg.steps && (
                    <div className="mt-3 space-y-2">
                      {msg.steps.map((step, i) => (
                        <p key={i} className="text-sm text-gray-700 leading-relaxed">
                          {step}
                        </p>
                      ))}
                    </div>
                  )}

                  {msg.options && (
                    <div className="mt-3 space-y-2">
                      {msg.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(option)}
                          className="block w-full text-left text-sm bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-gray-700 rounded-lg p-2 transition border border-indigo-200"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
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
                className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-full p-2 hover:shadow-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}