import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

// Reusable Staff Chatbot Component
export default function StaffChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm your Staff Assistant. I can help you with:",
      options: [
        "Register for events",
        "View my registrations",
        "Manage favorites",
        "View attended events",
        "Check events reviews",
        "View available booths",
        "Vote on booth polls",
        "Browse loyalty vendors",
        "Check gym schedule"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
      ]
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
      ]
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
      ]
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
        "6. Other staff members can see and benefit from your feedback",
        "7. Organizers use feedback to enhance event quality"
      ]
    },
    "events reviews": {
      steps: [
        "1. Click on 'Events Reviews' in the sidebar",
        "2. Browse reviews and ratings from all staff members",
        "3. You can see:",
        "   • Event ratings and overall scores",
        "   • Detailed comments from attendees",
        "   • Event quality indicators",
        "   • Feedback trends",
        "4. Use reviews to make informed decisions about future events",
        "5. Filter or search for specific event reviews",
        "6. Add your own reviews for events you've attended",
        "7. See what colleagues thought about past events"
      ]
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
      ]
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
        "7. Help shape future bazaar offerings"
      ]
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
        "7. Take advantage of special staff discounts"
      ]
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
      ]
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
      ]
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
      ]
    },
    "event types": {
      steps: [
        "Available event types you can register for:",
        "",
        "📚 Workshops:",
        "   • Skill-building and training sessions",
        "   • Professional development opportunities",
        "   • Hands-on learning experiences",
        "",
        "✈️ Trips:",
        "   • Educational excursions",
        "   • Team building outings",
        "   • Cultural visits",
        "",
        "🛍️ Bazaars:",
        "   • Vendor showcases and exhibitions",
        "   • Shopping opportunities",
        "   • Product demonstrations",
        "",
        "🎤 Conferences:",
        "   • Professional networking events",
        "   • Speaker sessions and panels",
        "   • Industry updates and discussions"
      ]
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
        "7. Submit your review",
        "8. Your feedback will be visible to other staff",
        "9. Organizers will see your input for improvements"
      ]
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
            "Register for events",
            "View my registrations",
            "Manage favorites",
            "View attended events",
            "Check gym schedule",
            "Vote on booth polls"
          ]
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Here's what I can help you with:",
          options: [
            "Register for events",
            "View my registrations",
            "Manage favorites",
            "View attended events",
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
                <p className="text-xs text-cyan-100">Here to help staff members</p>
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
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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
                          className="block w-full text-left text-sm bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 text-gray-700 rounded-lg p-2 transition border border-cyan-200"
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
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-2 hover:shadow-lg transition"
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