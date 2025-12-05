import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

// Reusable Event Officer Chatbot Component
export default function EventOfficerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm your Event Officer Assistant. I can help you with:",
      options: [
        "Create an event",
        "Approve workshops",
        "Manage vendors",
        "Create gym session",
        "View reports",
        "Manage booths",
        "View documents"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const knowledgeBase = {
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
          text: "Here are the steps:",
          steps: response.steps
        }]);
      } else if (lowerText.includes('help') || lowerText.includes('hi') || lowerText.includes('hello')) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I can help you with these topics:",
          options: [
            "Create an event",
            "Approve workshops",
            "Manage vendors",
            "Create gym session",
            "View reports",
            "Manage booths",
            "View documents"
          ]
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Here's what I can help you with:",
          options: [
            "Create an event",
            "Approve workshops",
            "Manage vendors",
            "Create gym session",
            "View reports",
            "Manage booths",
            "View documents"
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
                <p className="text-xs text-blue-100">Managing events made easy</p>
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
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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
                          className="block w-full text-left text-sm bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-gray-700 rounded-lg p-2 transition border border-blue-200"
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
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-2 hover:shadow-lg transition"
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