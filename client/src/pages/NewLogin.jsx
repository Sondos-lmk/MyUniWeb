import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { extractReferralFromURL, storeReferralCode, clearReferralCode } from "../utils/referralHelper";
import API from "../services/api";

export default function NewLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralEventName, setReferralEventName] = useState(null);

  // Capture and validate referral code from URL on mount
  useEffect(() => {
    const validateReferral = async () => {
      const referralData = extractReferralFromURL(searchParams);
      if (referralData) {
        try {
          // Validate the referral code with the backend (public endpoint)
          const response = await API.post("/payment/check-referral", {
            eventId: referralData.eventId,
            referralCode: referralData.code
          });
          
          // Fetch event details to show event name
          const eventResponse = await API.get(`/events/${referralData.eventId}`);
          const eventName = eventResponse.data.title;
          
          // If valid, store it
          storeReferralCode(referralData.code, referralData.eventId);
          setReferralEventName(eventName);
          
          // Store event name in sessionStorage to show after login
          sessionStorage.setItem('referralEventName', eventName);
        } catch (err) {
          // If invalid, show error and don't store it
          const errorMessage = err.response?.data?.error || "Invalid referral code";
          toast.error(errorMessage);
          clearReferralCode();
        }
      }
    };
    
    validateReferral();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const loggedInUser = await login(email, password);
      console.log('logged in user', loggedInUser);
      
      // Check if user logged in via referral link
      const storedEventName = sessionStorage.getItem('referralEventName');
      if (storedEventName) {
        toast.success(`🎉 You logged in through a referral link! Register and pay for "${storedEventName}" to get 15% cashback!`, {
          duration: 6000
        });
        sessionStorage.removeItem('referralEventName'); // Clear after showing
      } else {
        toast.success("Login successful!");
      }
      
      // Navigate based on role
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'eventOfficer') {
        navigate('/eventOfficer/dashboard');
      } else if (loggedInUser.role === 'student') {
        navigate('/student/dashboard'); 
      } else if (loggedInUser.role === 'staff') {
        navigate('/staff/dashboard'); 
      } else if (loggedInUser.role === 'ta') {
        navigate('/ta/dashboard');
      } else if (loggedInUser.role === 'professor') {
        navigate('/professor/dashboard');
      } else {
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="http://localhost:4000/uploads/logo/logoredefined.png"  alt="Innovex" className="w-40 h-40 object-contain"/>
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">Welcome to Innovex</CardTitle>
            <p className="text-slate-600">University Event Management Platform</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password here"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/signup-selection"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
