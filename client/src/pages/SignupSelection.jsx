import { useNavigate } from "react-router-dom";

export default function SignupSelection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-3xl font-bold mb-6">Sign up for Innovex</h1>
      <p className="text-gray-600 mb-10">Choose how you’d like to join</p>

      <div className="space-y-4">
        <button
          onClick={() => navigate("/signup/student")}
          className="w-64 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
        >
          Sign up as Student
        </button>

        <button
          onClick={() => navigate("/signup/faculty")}
          className="w-64 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium"
        >
          Sign up as Faculty 
        </button>

        <button
          onClick={() => navigate("/signup/vendor")}
          className="w-64 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-medium"
        >
          Sign up as Vendor
        </button>
      </div>
    </div>
  );
}
