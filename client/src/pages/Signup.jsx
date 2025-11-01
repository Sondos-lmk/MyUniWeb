import { useState } from "react";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function Signup({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageRole = role || location.pathname.split("/").pop();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: pageRole === "faculty" ? "professor" : pageRole,
    uniID: "",
    companyName: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return setMessage("Passwords do not match");

    // Client-side role-based validation
    const roleToCheck = formData.role;
    const email = (formData.email || '').trim().toLowerCase();

    if (roleToCheck === 'student') {
      if (!email.endsWith('@student.guc.edu.eg')) return setMessage('Student email must end with @student.guc.edu.eg');
      if (!formData.uniID || formData.uniID.trim() === '') return setMessage('University ID is required for students');
    }

    if (['staff', 'ta', 'professor'].includes(roleToCheck)) {
      if (!email.endsWith('@guc.edu.eg')) return setMessage(`${roleToCheck} email must end with @guc.edu.eg`);
      if (!formData.uniID || formData.uniID.trim() === '') return setMessage('University ID is required');
    }

    if (roleToCheck === 'vendor') {
      if (!formData.companyName || formData.companyName.trim() === '') return setMessage('Company name is required for vendors');
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      };

      if (["student", "staff", "ta", "professor"].includes(formData.role)) {
        payload.name = formData.name;
        payload.uniID = formData.uniID;
      } else if (formData.role === "vendor") {
        payload.companyName = formData.companyName;
      }

      await API.post("/auth/register", payload);
      setMessage("Signup successful!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {pageRole === "faculty" ? "Faculty Signup" : `${pageRole.charAt(0).toUpperCase() + pageRole.slice(1)} Signup`}
        </h2>

        {/* If the user landed on the faculty route, show a small role selector (professor/staff/ta) */}
        {pageRole === 'faculty' && (
          <div className="mb-2">
            <label className="block text-sm mb-1">Faculty role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full mb-2 p-2 border rounded">
              <option value="professor">Professor</option>
              <option value="staff">Staff</option>
              <option value="ta">TA</option>
            </select>
          </div>
        )}

        {formData.role === "vendor" ? (
          <input name="companyName" placeholder="Company Name" onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
        ) : (
          <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
        )}

        <input
          name="email"
          type="email"
          placeholder={formData.role === "vendor" ? "Company Email" : "GUC Email"}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          required
        />

        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />

        {["student", "staff", "ta", "professor"].includes(formData.role) && (
          <input name="uniID" placeholder="University ID" onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Sign Up
        </button>

        {message && <p className="text-center text-sm text-gray-600 mt-2">{message}</p>}
      </form>
    </div>
  );
}
