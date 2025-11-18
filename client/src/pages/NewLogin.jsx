import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

export default function NewLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const loggedInUser = await login(email, password);
      console.log('logged in user', loggedInUser);
      
      toast.success("Login successful!");
      
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
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-3 rounded-lg shadow-lg">
              <GraduationCap className="size-12 text-white" />
            </div>
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
