import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

/*export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    async function verify() {
      try {
        const res = await API.get(`/auth/verify/${token}`);
        if (res.status === 200 || res.status === 302) {
          setMessage("Verification successful! Redirecting to login...");
          setTimeout(() => navigate("/"), 2000);
        } else {
          setMessage("Invalid or expired verification link.");
        }
      } catch {
        setMessage("Invalid or expired verification link.");
      }
    }
    verify();
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-96 text-center">
        <h2 className="text-xl font-semibold mb-2">Email Verification</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}*/
export default function Verify() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-96 text-center">
        <h2 className="text-xl font-semibold mb-2">Email Verification</h2>
        <p>
          Please check your email for a verification link.
          <br />
          Once verified, you can log in to your account.
        </p>
      </div>
    </div>
  );
}

