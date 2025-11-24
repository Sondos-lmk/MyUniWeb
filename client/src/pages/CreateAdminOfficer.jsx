import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function CreateAdminOfficer() {
  const navigate = useNavigate();
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!adminForm.role) {
      alert("Please select a role (admin or event officer)");
      return;
    }

    if (!adminForm.email.endsWith("@guc.edu.eg")) {
      alert("Email must end with @guc.edu.eg");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please log in again.");
        navigate("/");
        return;
      }
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const url = `${apiUrl}/api/admin/create/${adminForm.role}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to create user (Status: ${response.status})`
        );
      }

      alert(`Successfully created ${adminForm.role}: ${data.user.name}`);
      setAdminForm({ name: "", email: "", password: "", role: "" });
    } catch (error) {
      console.error("Error creating user:", error.message);
      alert(`Error creating user: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create Admin/Event Officer Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                value={adminForm.name}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, name: e.target.value })
                }
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email (must end with @guc.edu.eg)</label>
              <input
                type="email"
                value={adminForm.email}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, email: e.target.value })
                }
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Role</label>
              <select
                value={adminForm.role}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, role: e.target.value })
                }
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Select a role</option>
                <option value="admin">Admin</option>
                <option value="eventOfficer">Event Officer</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Password</label>
              <input
                type="password"
                value={adminForm.password}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, password: e.target.value })
                }
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800"
            >
              Create Admin/Event Officer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
