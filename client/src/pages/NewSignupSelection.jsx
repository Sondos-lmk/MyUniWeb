import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { GraduationCap, User, Building2, BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NewSignupSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="absolute left-6 top-6"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Login
          </Button>
          <div className="flex justify-center">
            <div className="flex justify-center">
            <img src="http://localhost:4000/uploads/logo/logoredefined.png"  alt="Innovex" className="w-40 h-40 object-contain"/>
          </div>
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">Join Innovex</CardTitle>
            <p className="text-slate-600">Select your account type to get started</p>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Card */}
            <button
              onClick={() => navigate("/signup/student")}
              className="group relative bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all text-center"
            >
              <div className="bg-blue-100 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-700 transition-colors p-4 rounded-full inline-flex mb-4">
                <User className="size-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Student</h3>
              <p className="text-slate-600 text-sm">
                Register for events, join competitions, and participate in campus activities
              </p>
            </button>

            {/* Vendor Card */}
            <button
              onClick={() => navigate("/signup/vendor")}
              className="group relative bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all text-center"
            >
              <div className="bg-blue-100 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-700 transition-colors p-4 rounded-full inline-flex mb-4">
                <Building2 className="size-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Vendor</h3>
              <p className="text-slate-600 text-sm">
                Register your company to participate in bazaars and career fairs
              </p>
            </button>

            {/* Faculty Card */}
            <button
              onClick={() => navigate("/signup/faculty")}
              className="group relative bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all text-center"
            >
              <div className="bg-blue-100 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-700 transition-colors p-4 rounded-full inline-flex mb-4">
                <BookOpen className="size-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Faculty</h3>
              <p className="text-slate-600 text-sm">
                Create events, manage workshops, and organize conferences
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
