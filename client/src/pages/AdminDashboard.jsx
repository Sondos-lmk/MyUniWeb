import React from "react";
import { Link, useNavigate } from "react-router-dom";
import UpcomingEvents from "../components/UpcomingEvents";
import AttendeesReport from "../components/AttendeesReport";
import RevenueReport from "../components/RevenueReport";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { UserPlus, Users, UserCheck, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const sidebarItems = [
    { to: "/admin", label: "Overview", icon: GraduationCap },
    { to: "/admin/all-users", label: "All Users", icon: Users },
    { to: "/admin/create-admin-officer", label: "Create Admin/Officer", icon: UserPlus },
    { to: "/admin/manage-admins-officers", label: "Manage Admins/Officers", icon: Users },
    { to: "/admin/pending-users", label: "Pending Users", icon: UserCheck },
  ];

  return (
    <DashboardLayout dashboardTitle="Admin Dashboard" roleLabel="Administrator" roleColor="bg-indigo-600" sidebarItems={sidebarItems}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}

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
    </DashboardLayout>
  );
};

export default AdminDashboard;
