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
  const [taxDocument, setTaxDocument] = useState(null);
  const [logo, setLogo] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword)
      return setMessage("Passwords do not match");

    const roleToCheck = formData.role;
    const email = (formData.email || "").trim().toLowerCase();

    // Client-side validation
    if (roleToCheck === "student") {
      if (!email.endsWith("@student.guc.edu.eg"))
        return setMessage("Student email must end with @student.guc.edu.eg");
      if (!formData.uniID.trim()) return setMessage("University ID is required for students");
    }

    if (["staff", "ta", "professor"].includes(roleToCheck)) {
      if (!email.endsWith("@guc.edu.eg"))
        return setMessage(`${roleToCheck} email must end with @guc.edu.eg`);
      if (!formData.uniID.trim()) return setMessage("University ID is required");
    }

    if (roleToCheck === "vendor") {
      if (!formData.companyName.trim())
        return setMessage("Company name is required for vendors");
      if (!taxDocument || !logo)
        return setMessage("Please upload both Tax Document and Company Logo");
    }

    try {
      let payload;

      if (roleToCheck === "vendor") {
        // Use FormData for vendor (to handle files)
        payload = new FormData();
        payload.append("email", formData.email);
        payload.append("password", formData.password);
        payload.append("confirmPassword", formData.confirmPassword);
        payload.append("role", formData.role);
        payload.append("companyName", formData.companyName);
        payload.append("taxDocument", taxDocument);
        payload.append("logo", logo);
      } else {
        // JSON for normal users
        payload = {
          ...formData,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
        };
      }

      await API.post("/auth/register", payload, {
        headers: roleToCheck === "vendor" ? { "Content-Type": "multipart/form-data" } : {},
      });

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
          {pageRole === "faculty"
            ? "Faculty Signup"
            : `${pageRole.charAt(0).toUpperCase() + pageRole.slice(1)} Signup`}
        </h2>

        {pageRole === "faculty" && (
          <div className="mb-2">
            <label className="block text-sm mb-1">Faculty role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mb-2 p-2 border rounded"
            >
              <option value="professor">Professor</option>
              <option value="staff">Staff</option>
              <option value="ta">TA</option>
            </select>
          </div>
        )}

        {formData.role === "vendor" ? (
          <input
            name="companyName"
            placeholder="Company Name"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
            required
          />
        ) : (
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
          placeholder={formData.role === "vendor" ? "Company Email" : "GUC Email"}
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

        {["student", "staff", "ta", "professor"].includes(formData.role) && (
          <input
            name="uniID"
            placeholder="University ID"
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
            required
          />
        )}

        {formData.role === "vendor" && (
          <>
            <label className="block text-sm mb-1">Tax Document (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setTaxDocument(e.target.files[0])}
              className="w-full mb-2 p-2 border rounded"
              required
            />

            <label className="block text-sm mb-1">Company Logo (Image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files[0])}
              className="w-full mb-4 p-2 border rounded"
              required
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>

        {message && <p className="text-center text-sm text-gray-600 mt-2">{message}</p>}
      </form>
    </div>
  );
}
