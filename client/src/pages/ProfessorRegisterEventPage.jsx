import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import RegisterForEvent from "./RegisterForEvent";

function ProfessorRegisterEventPage() {
  const { user } = useAuth();
  const [activeTab] = useState("register-event");

  return (
    <DashboardLayout
      dashboardTitle="Professor Dashboard"
      roleLabel="Professor"
      roleColor="bg-green-500"
      // same sidebar items we’ll use on the dashboard
      sidebarItems={[
        { label: "Register for Event", to: "/professor/register-event" },
      ]}
      activeKey={activeTab}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Register for Event</h2>
        <p className="text-gray-600 mb-6">
          {user?.name
            ? `Hello ${user.name}, please fill in the form below to register.`
            : "Fill in the details below to register for a workshop or trip."}
        </p>

        <div className="bg-white rounded-xl shadow-md p-6">
          <RegisterForEvent />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfessorRegisterEventPage;
