import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import CreateWorkshop from "./CreateWorkshop";
import ProfessorChatbot from "../components/ProfessorChatbot";

function ProfessorCreateWorkshopPage() {
  const { user } = useAuth();
  const [activeTab] = useState("events"); // or "create-workshop" if you add tabs later

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
      <h2 className="text-2xl font-bold mb-4">
            Create New Workshop
            </h2>

            <p className="text-gray-600 mb-6">
            {user?.name ? `Hello ${user.name}, please fill in the workshop details below.` 
                        : "Fill in the details below to create a new workshop."}
            </p>


        <div className="bg-white rounded-xl shadow-md p-6">
          <CreateWorkshop />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfessorCreateWorkshopPage;
