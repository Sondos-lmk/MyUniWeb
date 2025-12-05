import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

// Reusable Student Chatbot Component
export default function StudentChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi Student! I'm your Campus Assistant. I can help you with:",
      options: [
        "Browse events",
        "Register for events",
        "Manage favorites",
        "Book court slots",
        "Check gym schedule",
        "Vote on booths",
        "View loyalty vendors",
        "Review events"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const knowledgeBase = {
    "browse events": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Go to the 'Upcoming Events' tab",
        "3. Browse all available events:",
        "   • Workshops and seminars",
        "   • Trips and excursions",
        "   • Bazaars and fairs",
        "   • Conferences",
        "4. Use the search and filter tools:",
        "   • Search by event title or keywords",
        "   • Filter by event type",
        "   • Filter by location",
        "   • Filter by specific date",
        "   • Sort by earliest or latest first",
        "5. Click on any event card to see full details",
        "6. Add events to favorites by clicking the heart icon",
        "7. Click 'Register' to sign up for events"
      ]
    },
    "register for events": {
      steps: [
        "1. Navigate to 'Events' section",
        "2. Find the event you want to attend",
        "3. Click on the event card to view details:",
        "   • Event description and schedule",
        "   • Location and requirements",
        "   • Price (if any)",
        "   • Available spots",
        "4. Click the 'Register' button",
        "5. Fill in the registration form:",
        "   • Confirm your details",
        "   • Provide any required information",
        "   • Accept terms and conditions",
        "6. Submit your registration",
        "7. If payment is required, complete the payment",
        "8. You'll receive a confirmation",
        "9. Check 'My Registrations' to track status"
      ]
    },
    "manage favorites": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. To add events to favorites:",
        "   • Browse 'Upcoming Events' tab",
        "   • Click the heart icon on any event card",
        "   • Event is instantly saved to favorites",
        "3. To view your favorites:",
        "   • Click the 'Favorites' tab",
        "   • See all your saved events in one place",
        "4. To remove from favorites:",
        "   • Click the heart icon again",
        "   • Event is removed from favorites",
        "5. Benefits of favorites:",
        "   • Quick access to events you're interested in",
        "   • Never lose track of important events",
        "   • Easy comparison between events"
      ]
    },
    "book court slots": {
      steps: [
        "1. Click on 'View Courts' in the sidebar",
        "2. You'll see all available campus courts:",
        "   • Basketball courts",
        "   • Tennis courts",
        "   • Football fields",
        "   • Other sports facilities",
        "3. Click on any court to view its availability",
        "4. Browse available time slots by date:",
        "   • Green/available slots can be booked",
        "   • Gray/booked slots show who reserved them",
        "5. To book a slot:",
        "   • Click on an available (green) time slot",
        "   • Confirm your booking details",
        "   • Booking is instant!",
        "6. Your booking will show:",
        "   • Your name and GUC ID",
        "   • Reserved date and time",
        "7. Note: You can only book available slots"
      ]
    },
    "check gym schedule": {
      steps: [
        "1. Click on 'Gym Schedule' in the sidebar",
        "2. View the complete weekly gym schedule:",
        "   • All gym sessions by day and time",
        "   • Session types (Cardio, Strength, Yoga, etc.)",
        "   • Instructor names",
        "   • Session capacity",
        "3. See which sessions are:",
        "   • Currently available for registration",
        "   • Fully booked",
        "   • Upcoming this week",
        "4. To register for a gym session:",
        "   • Find a session with available spots",
        "   • Click 'Register' or 'Book'",
        "   • Confirm your registration",
        "5. Check your registered sessions",
        "6. Plan your gym routine around the schedule"
      ]
    },
    "vote on booths": {
      steps: [
        "1. Click on 'Booth Polls' in the sidebar",
        "2. Browse active vendor booth polls",
        "3. For each booth you can see:",
        "   • Vendor company name",
        "   • Products or services they offer",
        "   • Booth description and benefits",
        "   • Photos or promotional materials",
        "4. To cast your vote:",
        "   • Read about what the booth offers",
        "   • Click the 'Vote' button",
        "   • Your vote is recorded",
        "5. Why voting matters:",
        "   • Helps select popular vendors",
        "   • Influences which booths appear at bazaars",
        "   • Gets you the vendors you want to see",
        "6. You can vote for multiple booths",
        "7. Results help event officers plan better"
      ]
    },
    "view loyalty vendors": {
      steps: [
        "1. Click on 'Loyalty Vendors' in the sidebar",
        "2. Browse all vendors with loyalty programs",
        "3. For each vendor you'll see:",
        "   • Company name and logo",
        "   • Business description",
        "   • Loyalty program benefits",
        "   • Points system details",
        "   • Special offers and discounts",
        "4. To join a loyalty program:",
        "   • Click on the vendor",
        "   • Review program terms",
        "   • Click 'Join Program'",
        "   • Start earning rewards!",
        "5. Benefits include:",
        "   • Exclusive student discounts",
        "   • Points on purchases",
        "   • Special promotions",
        "   • Early access to sales",
        "6. Track your rewards in the vendor portal"
      ]
    },
    "review events": {
      steps: [
        "1. To see all reviews:",
        "   • Click 'Events Reviews' in the sidebar",
        "   • Browse reviews from all students and professors",
        "2. To review an event you attended:",
        "   • Go to 'Events' section",
        "   • Click 'Attended Events' tab",
        "   • Find the event you want to review",
        "3. Click 'Write Review' or 'Rate Event'",
        "4. Provide your feedback:",
        "   • Rate the event (1-5 stars)",
        "   • Write detailed comments",
        "   • Share what you liked or didn't like",
        "   • Suggest improvements",
        "5. Submit your review",
        "6. Your feedback helps:",
        "   • Other students make decisions",
        "   • Event officers improve future events",
        "   • Professors plan better workshops",
        "7. Be honest and constructive!"
      ]
    },
    "my registrations": {
      steps: [
        "1. Click on 'Events' in the sidebar",
        "2. Go to 'My Registrations' tab",
        "3. See all events you've registered for:",
        "   • Upcoming events you'll attend",
        "   • Registration status (Pending/Confirmed)",
        "   • Payment status (Paid/Pending)",
        "   • Event dates and times",
        "4. For each registration you can:",
        "   • View full event details",
        "   • Check payment status",
        "   • Make payment if required",
        "   • Cancel registration (if allowed)",
        "5. Payment options:",
        "   • Some events are free",
        "   • Others require payment",
        "   • Pay online through the portal",
        "6. Keep track of all your commitments",
        "7. Get reminders before events"
      ]
    },
    "attended events": {
      steps: [
        "1. Click on 'Events' section",
        "2. Navigate to 'Attended Events' tab",
        "3. See all past events you've attended",
        "4. For each attended event:",
        "   • View event details and photos",
        "   • See who else attended",
        "   • Check if you received credit/points",
        "   • Leave a rating and review",
        "5. To rate an event:",
        "   • Click 'Rate Event'",
        "   • Give 1-5 stars",
        "   • Write optional comments",
        "   • Share your experience",
        "6. Build your event history",
        "7. Track your campus engagement"
      ]
    },
    "available booths": {
      steps: [
        "1. Click on 'Available Booths' in the sidebar",
        "2. Browse all vendor booths at upcoming bazaars",
        "3. Information shown for each booth:",
        "   • Vendor company name",
        "   • Products or services",
        "   • Booth location at venue",
        "   • Booth size (2x2 or 4x4)",
        "   • Bazaar event date and time",
        "4. Use this to:",
        "   • Plan which booths to visit",
        "   • Find specific products you need",
        "   • Discover new vendors",
        "   • Map out your bazaar route",
        "5. Filter booths by:",
        "   • Product category",
        "   • Vendor name",
        "   • Bazaar event",
        "6. This is informational only for students",
        "7. Visit booths during bazaar events"
      ]
    },
    "events reviews": {
      steps: [
        "1. Click 'Events Reviews' in the sidebar",
        "2. Browse all event reviews from the community",
        "3. You'll see:",
        "   • Overall event ratings",
        "   • Detailed reviews and comments",
        "   • Photos from attendees",
        "   • Pros and cons mentioned",
        "4. Filter reviews by:",
        "   • Event type",
        "   • Rating (5 stars, 4 stars, etc.)",
        "   • Most recent or most helpful",
        "5. Use reviews to:",
        "   • Decide which events to attend",
        "   • Learn from others' experiences",
        "   • Find the best workshops",
        "   • Avoid poorly organized events",
        "6. Add your own reviews after attending",
        "7. Help the community make better choices"
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
            "Browse events",
            "Register for events",
            "Manage favorites",
            "Book court slots",
            "Check gym schedule",
            "Vote on booths",
            "View loyalty vendors",
            "Review events"
          ]
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: "I'm not sure about that. Here's what I can help you with:",
          options: [
            "Browse events",
            "Register for events",
            "Manage favorites",
            "Book court slots",
            "Check gym schedule",
            "Vote on booths"
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
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center z-50 group ${
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
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Campus Assistant</h3>
                <p className="text-xs text-green-100">Your student guide</p>
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
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl p-3 shadow-sm`}>
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
                          className="block w-full text-left text-sm bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 text-gray-700 rounded-lg p-2 transition border border-green-200"
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
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full p-2 hover:shadow-lg transition"
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