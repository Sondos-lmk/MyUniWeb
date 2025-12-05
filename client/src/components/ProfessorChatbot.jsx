import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

// Reusable Professor Chatbot Component
export default function ProfessorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi Professor! I'm your Academic Assistant. I can help you with:",
      options: [
        "Create a workshop",
        "View my workshops",
        "Register for events",
        "Check gym schedule",
        "View booth polls",
        "Browse loyalty vendors",
        "Manage favorites",
        "Check registrations",
        "View attended events",
        "Browse events reviews"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
            "Create a workshop",
            "View my workshops",
            "Register for events",
            "Check gym schedule",
            "View booth polls",
            "Browse loyalty vendors"
          ]
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Here's what I can help you with:",
          options: [
            "Create a workshop",
            "View my workshops",
            "Register for events",
            "Check gym schedule",
            "View booth polls",
            "Browse loyalty vendors"
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
                <p className="text-xs text-green-100">Here to help professors</p>
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
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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
                          className="block w-full text-left text-sm bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-700 rounded-lg p-2 transition border border-green-200"
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
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-2 hover:shadow-lg transition"
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