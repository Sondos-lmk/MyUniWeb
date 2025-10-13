import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    uniID: "",
    companyName: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
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
      }

      if (formData.role === "vendor") {
        payload.companyName = formData.companyName;
      }

      const res = await API.post("/auth/register", payload);
      setMessage("Signup successful! Check your email for verification.");
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>


        {/* Show companyName for vendor */}
        {formData.role === "vendor" && (
          <input
            name="companyName"
            placeholder="Company Name"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
            required
          />
        )}

        {/* Show name only for non-vendor roles */}
        {formData.role !== "vendor" && (
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
            required
          />
        )}

        <input
          name="email"
          type="email"
          placeholder={
            formData.role === "vendor" ? "Company Email" : "GUC Email"
          }
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          required
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          required
        />

        <select
          name="role"
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
        >
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="ta">TA</option>
          <option value="professor">Professor</option>
          <option value="vendor">Vendor</option>
        </select>

        {/* Show uniID for student/staff/TA/professor */}
        {["student", "staff", "ta", "professor"].includes(formData.role) && (
          <input
            name="uniID"
            placeholder="University ID"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
            required
          />
        )}

        

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>

        {message && (
          <p className="text-center text-sm text-gray-600 mt-2">{message}</p>
        )}
      </form>
    </div>
  );
}
