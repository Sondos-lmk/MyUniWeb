import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import UpcomingEvents from "../components/UpcomingEvents.jsx";
import AttendeesReport from "../components/AttendeesReport";
import RevenueReport from "../components/RevenueReport";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Dumbbell, Store, Archive, GraduationCap, ArrowLeft } from "lucide-react";

function EventOfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout dashboardTitle="Event Officer Dashboard" roleLabel="Events Officer" roleColor="bg-cyan-600" sidebarItems={[]}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Event Officer Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Welcome back {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "Event Officer"}!
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/create-gym-session">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800">
                  <Dumbbell className="w-6 h-6" />
                  <span>Create Gym Session</span>
                </Button>
              </Link>

              <Link to="/gym-schedule">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800">
                  <Calendar className="w-6 h-6" />
                  <span>View Gym Schedule</span>
                </Button>
              </Link>

              <Link to="/loyalty-vendors">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
                  <Store className="w-6 h-6" />
                  <span>Loyalty Vendors</span>
                </Button>
              </Link>

              <Link to="/eventOfficer/archived-events">
                <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800">
                  <Archive className="w-6 h-6" />
                  <span>Archived Events</span>
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
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <UpcomingEvents />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default EventOfficerDashboard;
