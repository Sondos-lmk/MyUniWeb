import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyWorkshops } from "../services/workshop";
import DashboardLayout from "../components/DashboardLayout";
import { Link } from "react-router-dom";
import ProfessorChatbot from "../components/ProfessorChatbot";


function ProfessorMyWorkshopsPage() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyWorkshops();
        setWorkshops(data?.workshops || []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      }
    })();
  }, []);

  return (
    <DashboardLayout
      dashboardTitle="Professor Dashboard"
      roleLabel="Professor"
      roleColor="bg-green-500"
      sidebarItems={[]}
      activeKey="my-workshops"
    >
      {/* Chatbot Component */}
      <ProfessorChatbot />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Workshops</h1>

        {error && <div className="text-red-600">{error}</div>}

        {workshops.length === 0 ? (
          <p className="text-gray-600">You haven't created any workshops yet.</p>
        ) : (
          <div className="space-y-4">
            {workshops.map((w) => (
              <div
                key={w._id}
                className="bg-white shadow p-4 rounded-lg border"
              >
                <h2 className="text-lg font-bold">{w.title}</h2>

                <p className="text-sm text-gray-600">
                  Status: {w.status} • Registration Deadline:{" "}
                  {new Date(w.registrationDeadline).toLocaleString()}
                </p>

                {w.editRequest && w.status !== "approved" && (
                  <p className="text-sm text-orange-600 mt-1">
                    <strong>Requested edits:</strong> {w.editRequest}
                  </p>
                )}

                <div className="flex gap-3 mt-3">
                  <Link
                    to={`/professor/workshops/${w._id}/edit`}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/professor/workshops/${w._id}/participants`}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Participants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProfessorMyWorkshopsPage;

