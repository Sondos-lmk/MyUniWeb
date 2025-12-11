import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import API from "../services/api";
import { extractReferralFromURL, storeReferralCode, clearReferralCode } from "../utils/referralHelper";

export default function NewFacultySignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    uniID: "",
    role: "professor",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // Capture and validate referral code from URL on mount
  useEffect(() => {
    const validateReferral = async () => {
      const referralData = extractReferralFromURL(searchParams);
      if (referralData) {
        try {
          await API.post("/payment/check-referral", {
            eventId: referralData.eventId,
            referralCode: referralData.code
          });
          
          // Fetch event details
          const eventResponse = await API.get(`/events/${referralData.eventId}`);
          const eventName = eventResponse.data.title;
          
          storeReferralCode(referralData.code, referralData.eventId);
          sessionStorage.setItem('referralEventName', eventName);
        } catch (err) {
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
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.name || !formData.email || !formData.uniID || !formData.role || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const email = formData.email.trim().toLowerCase();
    if (!email.endsWith("@guc.edu.eg")) {
      toast.error("Faculty email must end with @guc.edu.eg");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        uniID: formData.uniID,
      });

      const roleLabel = formData.role.charAt(0).toUpperCase() + formData.role.slice(1);
      toast.success(`${roleLabel} account created successfully!`);
      
      // Check if registered via referral link
      const storedEventName = sessionStorage.getItem('referralEventName');
      if (storedEventName) {
        setTimeout(() => {
          toast.success(`🎉 You signed up through a referral link! Login and pay for "${storedEventName}" to get 15% cashback!`, {
            duration: 6000
          });
        }, 500);
      }
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/signup-selection")}
            className="absolute left-6 top-6"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-3 rounded-lg shadow-lg">
              <GraduationCap className="size-12 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl mb-2">Faculty Registration</CardTitle>
            <p className="text-slate-600">Create your faculty account</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">University Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="faculty@guc.edu.eg"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Faculty Type</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty type">
                    {formData.role === "professor" && "Professor"}
                    {formData.role === "ta" && "Teaching Assistant"}
                    {formData.role === "staff" && "Staff"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="ta">Teaching Assistant</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uniID">Employee ID</Label>
              <Input
                id="uniID"
                placeholder="12345"
                value={formData.uniID}
                onChange={(e) => setFormData({ ...formData, uniID: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
