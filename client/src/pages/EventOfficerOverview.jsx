import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Dumbbell, Store } from "lucide-react";

export default function EventOfficerOverview() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/create-event">
              <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white">
                <Calendar className="w-6 h-6" />
                <span>Create Event</span>
              </Button>
            </Link>
            <Link to="/approved-events">
              <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white">
                <Store className="w-6 h-6" />
                <span>Approve Vendors</span>
              </Button>
            </Link>
            <Link to="/create-gym-session">
              <Button className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white">
                <Dumbbell className="w-6 h-6" />
                <span>Create Gym Session</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
