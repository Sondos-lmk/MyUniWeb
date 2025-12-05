import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import GymSchedule from "./GymSchedule";
import ProfessorChatbot from "../components/ProfessorChatbot";

function ProfessorGymSchedulePage() {
  const { user } = useAuth();
  const [activeTab] = useState("events");

  const sidebarItems = [
    { label: "Register for Event", to: "/professor/register-event" },
    { label: "Gym Schedule", to: "/professor/gym-schedule" }, // ✅ current page
  ];

  return (
    <DashboardLayout
      dashboardTitle="Professor Dashboard"
      roleLabel="Professor"
      roleColor="bg-green-500"
      sidebarItems={sidebarItems}
      activeKey={activeTab}
    >
      {/* Chatbot Component */}
      <ProfessorChatbot />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          Gym Schedule
        </h2>

        <p className="text-gray-600 mb-6">
          {user?.name
            ? `Hello ${user.name}, here is the current gym schedule.`
            : "Here is the current gym schedule."}
        </p>

        <div className="bg-gray-50 border p-4 rounded-lg shadow-md">
          <GymSchedule />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfessorGymSchedulePage;
