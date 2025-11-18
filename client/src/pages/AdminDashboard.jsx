import React from "react";
import { Link, useNavigate } from "react-router-dom";
import UpcomingEvents from "../components/UpcomingEvents";
import AttendeesReport from "../components/AttendeesReport";
import RevenueReport from "../components/RevenueReport";
import Navbar from "../components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { UserPlus, Users, UserCheck, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-indigo-100">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Welcome back {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "Admin"}!
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/create-admin-officer">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800">
                  <UserPlus className="w-6 h-6" />
                  <span>Create Admin/Officer</span>
                </Button>
              </Link>

              <Link to="/admin/manage-admins-officers">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
                  <Users className="w-6 h-6" />
                  <span>Manage Admins/Officers</span>
                </Button>
              </Link>

              <Link to="/admin/pending-users">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800">
                  <UserCheck className="w-6 h-6" />
                  <span>Pending Users</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attendees Report */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <AttendeesReport />
            </CardContent>
          </Card>

          {/* Revenue Report */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <RevenueReport />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Section */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-6">
            <UpcomingEvents />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
