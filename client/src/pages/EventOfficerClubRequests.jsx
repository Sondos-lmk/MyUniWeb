import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import API from "../services/api";
import ModernAlert from "../components/ui/ModernAlert";
import RejectClubRequestModal from "../components/RejectClubRequestModal";
import ClubCreationRequestCard from "../components/ClubCreationRequestCard";
import {
  GraduationCap,
  ListChecks,
  ClipboardList,
  Dumbbell,
  Store,
  FileText,
  Folder,
  ShoppingBag,
  Users,
} from "lucide-react";

export default function EventOfficerClubRequests() {
  const navigate = useNavigate();

  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState("attendees");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success");

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const sidebarItems = useMemo(
    () => [
      { to: "/eventOfficer/dashboard", label: "Overview", icon: GraduationCap },
      { to: "/eventOfficer/approveWorkshops", label: "Workshops", icon: ListChecks },
      { to: "/eventOfficer/all-events", label: "All Events", icon: ClipboardList },
      { to: "/eventOfficer/club-requests", label: "Club Requests", icon: Users },
      { to: "/eventOfficer/available-booths", label: "Available Booths", icon: ShoppingBag },
      { to: "/gym-schedule", label: "Gym Schedule", icon: Dumbbell },
      { to: "/eventOfficer/loyalty-vendors", label: "Loyalty Vendors", icon: Store },
      { to: "/eventOfficer/documents", label: "View Documents", icon: Folder },

      {
        key: "reports",
        label: "Reports",
        icon: FileText,
        isCollapsible: true,
        isOpen: isReportsOpen,
        onToggle: () => setIsReportsOpen((s) => !s),
        subItems: [
          {
            label: "Attendees Report",
            onClick: () => {
              setSelectedReport("attendees");
              navigate("/eventOfficer/attendees-report");
              setIsReportsOpen(true);
            },
          },
          {
            label: "Revenue Report",
            onClick: () => {
              setSelectedReport("revenue");
              navigate("/eventOfficer/revenue-report");
              setIsReportsOpen(true);
            },
          },
        ],
      },
    ],
    [isReportsOpen, navigate]
  );

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/clubs/admin/creation-requests");
      setRequests(res.data?.requests || []);
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to load club requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await API.patch(`/clubs/admin/creation-requests/${id}/approve`);
      showAlert("Club request approved ✅", "success");
      fetchRequests();
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to approve request", "error");
    }
  };

  const openReject = (req) => {
    setSelectedReq(req);
    setRejectOpen(true);
  };

  const submitReject = async (rejectionReason) => {
    try {
      await API.patch(`/clubs/admin/creation-requests/${selectedReq._id}/reject`, {
        rejectionReason,
      });
      setRejectOpen(false);
      setSelectedReq(null);
      showAlert("Club request rejected ❌", "success");
      fetchRequests();
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to reject request", "error");
    }
  };

  return (
    <DashboardLayout
      dashboardTitle="Event Officer Dashboard"
      roleLabel="Events Officer"
      roleColor="bg-blue-600"
      sidebarItems={sidebarItems}
      extraSidebarProps={{ isReportsOpen, selectedReport }}
      activeKey="club-requests"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Club Creation Requests</h2>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-center text-slate-600">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-slate-600">No club creation requests yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <ClubCreationRequestCard
                key={req._id}
                request={req}
                onApprove={() => handleApprove(req._id)}
                onReject={() => openReject(req)}
              />
            ))}
          </div>
        )}
      </div>

      <ModernAlert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />

      {rejectOpen && selectedReq && (
        <RejectClubRequestModal
          open={rejectOpen}
          onClose={() => {
            setRejectOpen(false);
            setSelectedReq(null);
          }}
          onSubmit={submitReject}
          clubName={selectedReq.name}
        />
      )}
    </DashboardLayout>
  );
}
