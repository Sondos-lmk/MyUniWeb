import DashboardLayout from "../components/DashboardLayout";
import UpcomingEvents from "../components/UpcomingEvents";
import { useState } from "react";
import ProfessorChatbot from "../components/ProfessorChatbot";


function ProfessorUpcomingEventsPage() {
  const [activeTab] = useState("events"); // just to keep DashboardLayout happy

  return (
    <DashboardLayout
      dashboardTitle="Professor Dashboard"
      roleLabel="Professor"
      roleColor="bg-green-500"
      sidebarItems={[]}
      activeKey={activeTab}
    >
      {/* Chatbot Component */}
      <ProfessorChatbot />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        <p className="text-gray-600 mb-6">
          Browse all upcoming events you can register for or follow.
        </p>

        <div className="bg-white rounded-xl shadow-md p-6">
          <UpcomingEvents userRole="professor" />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfessorUpcomingEventsPage;
